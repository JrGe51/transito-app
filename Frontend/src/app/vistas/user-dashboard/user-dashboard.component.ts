import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../interfaces/user';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../servicios/user.service';
import { SolicitudService } from '../../servicios/solicitud.service';
import { Solicitud } from '../../interfaces/solicitud';
import Swal from 'sweetalert2';
import { LoadingService } from '../../servicios/loading.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  userData: User | undefined;
  showProfileInfo: boolean = false;
  editMode: boolean = false;
  editUserForm: FormGroup;

  showSolicitudesInfo: boolean = false;
  userSolicitudes: Solicitud[] = [];
  loadingSolicitudes: boolean = false;
  solicitudesErrorMessage: string = '';

  constructor(
    private router: Router,
    private toast: ToastrService,
    private fb: FormBuilder,
    private userService: UserService,
    private solicitudService: SolicitudService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {
    this.editUserForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fechanacimiento: ['', Validators.required],
      rut: ['', Validators.required],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      this.userData = JSON.parse(userString);
      if (this.userData) {
        this.editUserForm.patchValue(this.userData);
      }
    }
  }

  navigateTo(route: string): void {
    console.log('Navegando a:', route);
    this.router.navigate([route]);
  }

  irAReservaPrimeraLicencia(): void {
    this.router.navigate(['/reserva'], { queryParams: { tipoTramite: 'Primera Licencia' } });
  }

  irAReservaRenovacion(): void {
    this.router.navigate(['/reserva2'], { queryParams: { tipoTramite: 'Renovación' } });
  }

  irAReservaCambioClase(): void {
    this.router.navigate(['/reserva3'], { queryParams: { tipoTramite: 'Cambio de Clase' } });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.toast.info('Sesión cerrada', 'Hasta pronto!');
    this.router.navigate(['/login']);
  }

  toggleProfileInfo(): void {
    this.showProfileInfo = !this.showProfileInfo;
    if (!this.showProfileInfo) {
      this.editMode = false;
      if (this.userData) {
        this.editUserForm.patchValue(this.userData);
      }
    }
    this.showSolicitudesInfo = false;
  }

  onEdit(): void {
    this.editMode = true;
    if (this.userData) {
      this.editUserForm.patchValue(this.userData);
    }
  }

  onCancelEdit(): void {
    this.editMode = false;
    if (this.userData) {
      this.editUserForm.patchValue(this.userData);
    }
  }

  onSave(): void {
    if (this.editUserForm.valid && this.userData) {
      const updatedUserData: User = { ...this.userData, ...this.editUserForm.value };
      this.userService.updateUser(updatedUserData.id!, updatedUserData).subscribe({
        next: (response: any) => {
          this.toast.success('Datos actualizados correctamente', 'Éxito');
          this.userData = updatedUserData;
          localStorage.setItem('user', JSON.stringify(this.userData));
          this.editMode = false;
        },
        error: (error: any) => {
          this.toast.error('Error al actualizar los datos', 'Error');
          console.error('Error al actualizar el usuario:', error);
        }
      });
    }
  }

  toggleSolicitudesInfo(): void {
    this.showSolicitudesInfo = !this.showSolicitudesInfo;
    if (this.showSolicitudesInfo) {
      this.getSolicitudes();
    }
    this.showProfileInfo = false;
    this.editMode = false;
  }

  getSolicitudes(): void {
    this.loadingSolicitudes = true;
    this.solicitudesErrorMessage = '';
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user && user.id) {
        this.solicitudService.getSolicitudesByUser(user.id).subscribe({
          next: (data) => {
            this.userSolicitudes = data.solicitudes;
            this.loadingSolicitudes = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error al obtener las solicitudes:', error);
            this.solicitudesErrorMessage = error.error?.msg || 'Error al cargar las solicitudes.';
            if (error.status === 404) {
              this.userSolicitudes = [];
            } else {
              this.toast.error(this.solicitudesErrorMessage, 'Error');
            }
            this.loadingSolicitudes = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        this.solicitudesErrorMessage = 'No se encontró el ID del usuario en el almacenamiento local.';
        this.toast.error(this.solicitudesErrorMessage, 'Error de usuario');
        this.loadingSolicitudes = false;
        this.cdr.detectChanges();
      }
    } else {
      this.solicitudesErrorMessage = 'No se encontraron datos de usuario en el almacenamiento local.';
      this.toast.error(this.solicitudesErrorMessage, 'Error de usuario');
      this.loadingSolicitudes = false;
      this.cdr.detectChanges();
    }
  }

  cancelarSolicitud(id: number): void {
    Swal.fire({
      title: '¿Está seguro de que desea cancelar esta solicitud?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Cancelando solicitud...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        this.solicitudService.deleteSolicitud(id).subscribe({
          next: () => {
            Swal.fire(
              '¡Cancelada!',
              'La solicitud ha sido cancelada exitosamente.',
              'success'
            );
            this.getSolicitudes();
          },
          error: (error) => {
            console.error('Error al cancelar la solicitud:', error);
            Swal.fire(
              'Error',
              'Error al cancelar la solicitud',
              'error'
            );
          }
        });
      }
    });
  }

  // Función helper para mostrar licencias en el template
  mostrarLicencias(licencias: string[] | undefined): string {
    if (licencias && Array.isArray(licencias) && licencias.length > 0) {
      return licencias.join(', ');
    }
    return 'sin licencia';
  }
  // Método para probar el spinner
  testLoading(): void {
    this.loadingService.show();
    setTimeout(() => {
      this.loadingService.hide();
    }, 3000);
  }
} 