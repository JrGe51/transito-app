import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { HorarioService } from '../../servicios/horario.service';
import { LicenciaService } from '../../servicios/licencia.service';
import { UserService } from '../../servicios/user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { User } from '../../interfaces/user';
import { SolicitudService } from '../../servicios/solicitud.service';
import { Solicitud } from '../../interfaces/solicitud';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
  showHorariosManagement: boolean = false;
  showLicenciasManagement: boolean = false;
  showUsersManagement: boolean = false;
  showCreateForm: boolean = false;
  showCreateLicenciaForm: boolean = false;
  showSolicitudesManagement: boolean = false;
  horarios: any[] = [];
  licencias: any[] = [];
  users: User[] = [];
  filteredUsers: User[] = [];
  tiposLicencia: string[] = [];
  minDate: string;
  shouldShowTable: boolean = false;
  shouldShowLicenciasTable: boolean = false;
  shouldShowUsersTable: boolean = false;
  userSearchRut: string = '';
  editUserForm: FormGroup;
  editingUser: User | null = null;
  solicitudes: Solicitud[] = [];
  filteredSolicitudes: Solicitud[] = [];
  solicitudSearchRut: string = '';
  

  nuevoHorario = {
    fecha: '',
    hora: '',
    name: '',
    cupodisponible: true
  };


  nuevaLicencia = {
    name: '',
    description: ''
  };

  constructor(
    private horarioService: HorarioService,
    private licenciaService: LicenciaService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastrService,
    private fb: FormBuilder,
    private solicitudService: SolicitudService
  ) {
    this.minDate = this.getTomorrowDate();

    this.editUserForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      rut: ['', [Validators.required, Validators.pattern(/^\d{1,2}\.\d{3}\.\d{3}-[0-9kK]$/)]],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)]],
      telefono: ['', Validators.required],
      fechanacimiento: ['', Validators.required],
      direccion: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    }
    this.loadLicencias();
  }

  private getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  toggleHorariosManagement() {
    this.showHorariosManagement = !this.showHorariosManagement;
    if (this.showHorariosManagement) {
      this.loadHorarios();
      this.showLicenciasManagement = false;
      this.showCreateLicenciaForm = false;
      this.showUsersManagement = false;
      this.showSolicitudesManagement = false;
    } else {
      this.horarios = [];
      this.showCreateForm = false;
      this.shouldShowTable = false;
      this.cdr.markForCheck();
    }
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetNuevoHorario();
      this.cdr.markForCheck();
    }
  }

  resetNuevoHorario() {
    this.nuevoHorario = {
      fecha: '',
      hora: '',
      name: '',
      cupodisponible: true
    };
  }

  loadHorarios() {

    this.shouldShowTable = false;
    this.cdr.markForCheck();

    this.horarioService.getAllHorarios().subscribe({
      next: (data: any) => {

        setTimeout(() => {
          this.horarios = data.map((item: any) => ({
            id: item.id,
            fecha: item.fecha,
            hora: item.hora,
            tipoLicenciaMostrado: item.licenciaName || 'N/A',
            cupodisponible: item.cupodisponible
          }));
          

          this.shouldShowTable = true;
          this.cdr.markForCheck();
        }, 100);
      },
      error: (err: any) => {
        console.error('Error al cargar horarios:', err);
        this.shouldShowTable = true;
        this.cdr.markForCheck();
      }
    });
  }

  crearHorario() {
    if (!this.nuevoHorario.fecha || !this.nuevoHorario.hora || !this.nuevoHorario.name) {
      this.toast.error('Por favor complete todos los campos', 'Error');
      return;
    }
    this.nuevoHorario.name = this.nuevoHorario.name.trim();
    console.log('Enviando horario:', this.nuevoHorario);
    this.horarioService.registerHorario(this.nuevoHorario).subscribe({
      next: (response) => {
        Swal.fire('¡Éxito!', 'Horario creado exitosamente', 'success');
        this.loadHorarios();
        this.toggleCreateForm();
        this.resetNuevoHorario();
      },
      error: (error) => {
        console.error('Error al crear horario:', error);
        Swal.fire('Error', 'Error al crear el horario', 'error');
      }
    });
  }

  eliminarHorario(id: number) {
    Swal.fire({
      title: '¿Está seguro de que desea eliminar este horario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.horarioService.eliminarHorario(id).subscribe({
          next: (response) => {
            Swal.fire('¡Eliminado!', 'Horario eliminado exitosamente', 'success');
            this.loadHorarios();
          },
          error: (error) => {
            console.error('Error al eliminar horario:', error);
            Swal.fire('Error', 'Error al eliminar el horario', 'error');
          }
        });
      }
    });
  }

  toggleLicenciasManagement() {
    this.showLicenciasManagement = !this.showLicenciasManagement;
    if (this.showLicenciasManagement) {
      this.loadLicencias();
      this.showHorariosManagement = false;
      this.showCreateForm = false;
      this.showUsersManagement = false;
      this.showSolicitudesManagement = false;
    } else {
      this.licencias = [];
      this.showCreateLicenciaForm = false;
      this.shouldShowLicenciasTable = false;
      this.cdr.markForCheck();
    }
  }

  toggleCreateLicenciaForm() {
    this.showCreateLicenciaForm = !this.showCreateLicenciaForm;
    if (!this.showCreateLicenciaForm) {
      this.resetNuevaLicencia();
      this.cdr.markForCheck();
    }
  }

  resetNuevaLicencia() {
    this.nuevaLicencia = {
      name: '',
      description: ''
    };
  }

  loadLicencias() {
    this.shouldShowLicenciasTable = false;
    this.cdr.markForCheck();
    this.licenciaService.getAllLicencias().subscribe({
      next: (data: any) => {
        setTimeout(() => {
          this.licencias = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description
          }));
          this.tiposLicencia = data.map((item: any) => item.name);
          this.shouldShowLicenciasTable = true;
          this.cdr.markForCheck();
        }, 100);
      },
      error: (err: any) => {
        console.error('Error al cargar licencias:', err);
        this.shouldShowLicenciasTable = true;
        this.cdr.markForCheck();
      }
    });
  }

  crearLicencia() {
    if (!this.nuevaLicencia.name || !this.nuevaLicencia.description) {
      this.toast.error('Por favor complete todos los campos', 'Error');
      return;
    }
    this.licenciaService.registerLicencia(this.nuevaLicencia).subscribe({
      next: (response) => {
        Swal.fire('¡Éxito!', 'Licencia creada exitosamente', 'success');
        this.loadLicencias();
        this.toggleCreateLicenciaForm();
        this.resetNuevaLicencia();
      },
      error: (error) => {
        console.error('Error al crear licencia:', error);
        Swal.fire('Error', error.error?.msg || 'Error al crear la licencia', 'error');
      }
    });
  }

  eliminarLicencia(id: number) {
    Swal.fire({
      title: '¿Está seguro de que desea eliminar esta licencia?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.licenciaService.eliminarLicencia(id).subscribe({
          next: (response) => {
            Swal.fire('¡Eliminada!', 'Licencia eliminada exitosamente', 'success');
            this.loadLicencias();
          },
          error: (error) => {
            console.error('Error al eliminar licencia:', error);
            Swal.fire('Error', 'Error al eliminar la licencia', 'error');
          }
        });
      }
    });
  }

  toggleUsersManagement(): void {
    this.showUsersManagement = !this.showUsersManagement;
    if (this.showUsersManagement) {
      this.loadUsers();
      this.showHorariosManagement = false;
      this.showLicenciasManagement = false;
      this.showSolicitudesManagement = false;
    } else {
      this.users = [];
      this.filteredUsers = [];
    }
  }

  loadUsers(): void {
    this.shouldShowUsersTable = false;
    this.cdr.markForCheck();
    this.userService.getAllUsers().subscribe({
      next: (data: any) => {
        setTimeout(() => {
          this.users = data.users.map((user: User) => ({
            ...user,
            fechanacimiento: user.fechanacimiento ? new Date(user.fechanacimiento).toISOString().split('T')[0] : ''
          }));
          this.filteredUsers = [...this.users];
          this.shouldShowUsersTable = true;
          this.cdr.markForCheck();
        }, 100);
      },
      error: (err: any) => {
        console.error('Error al cargar usuarios:', err);
        this.shouldShowUsersTable = true;
        this.cdr.markForCheck();
        this.toast.error('Error al cargar usuarios.', 'Error');
      }
    });
  }

  editUser(user: User): void {
    this.editingUser = { ...user };
    this.editUserForm.patchValue(this.editingUser);
    this.cdr.markForCheck();
  }

  saveUser(): void {
    if (this.editUserForm.valid && this.editingUser) {
      const updatedUserData: User = { ...this.editingUser, ...this.editUserForm.value };
      this.userService.updateUser(updatedUserData.id!, updatedUserData).subscribe({
        next: (response: any) => {
          Swal.fire('¡Éxito!', 'Usuario actualizado correctamente', 'success');
          this.loadUsers();
          this.cancelEditUser();
        },
        error: (error) => {
          console.error('Error al actualizar el usuario:', error);
          const errorMessage = error.error?.msg || 'Error al actualizar el usuario.';

          if (errorMessage.includes('RUT') && errorMessage.includes('email')) {
            Swal.fire('Error', 'El RUT y el email ya están en uso por otro usuario.', 'error');
          } else if (errorMessage.includes('RUT')) {
            Swal.fire('Error', 'El RUT ya está en uso por otro usuario.', 'error');
          } else if (errorMessage.includes('email')) {
            Swal.fire('Error', 'El email ya está en uso por otro usuario.', 'error');
          } else {
            Swal.fire('Error', errorMessage, 'error');
          }
        }
      });
    }
  }

  cancelEditUser(): void {
    this.editingUser = null;
    this.editUserForm.reset();
    this.cdr.markForCheck();
  }

  deleteUser(id: number): void {
    Swal.fire({
      title: '¿Está seguro de que desea eliminar este usuario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(id).subscribe({
          next: (response) => {
            Swal.fire('¡Eliminado!', 'Usuario eliminado exitosamente', 'success');
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error al eliminar usuario:', error);
            Swal.fire('Error', 'Error al eliminar el usuario', 'error');
          }
        });
      }
    });
  }

  filterUsersByRut(): void {
    if (this.userSearchRut.trim() === '') {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user => 
        user.rut?.toLowerCase().includes(this.userSearchRut.trim().toLowerCase())
      );
    }
    this.cdr.markForCheck();
  }

  formatRut(event: any): void {
    let rut = event.target.value.replace(/[^0-9kK]/g, '');
    if (rut.length > 1) {
      rut = rut.slice(0, -1) + '-' + rut.slice(-1);
    }
    if (rut.length > 4) {
      rut = rut.slice(0, -5) + '.' + rut.slice(-5);
    }
    if (rut.length > 8) {
      rut = rut.slice(0, -9) + '.' + rut.slice(-9);
    }
    this.editUserForm.get('rut')?.setValue(rut, { emitEvent: false });
  }

  formatSearchRut(event: any): void {
    let rut = event.target.value.replace(/[^0-9kK]/g, '');
    if (rut.length > 1) {
      rut = rut.slice(0, -1) + '-' + rut.slice(-1);
    }
    if (rut.length > 4) {
      rut = rut.slice(0, -5) + '.' + rut.slice(-5);
    }
    if (rut.length > 8) {
      rut = rut.slice(0, -9) + '.' + rut.slice(-9);
    }
    this.userSearchRut = rut;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.toast.info('Sesión cerrada', 'Hasta pronto!');
    this.router.navigate(['/login']);
  }

  toggleSolicitudesManagement(): void {
    this.showSolicitudesManagement = !this.showSolicitudesManagement;
    if (this.showSolicitudesManagement) {
      this.loadSolicitudes();
      this.showHorariosManagement = false;
      this.showLicenciasManagement = false;
      this.showUsersManagement = false;
      this.showCreateForm = false;
      this.showCreateLicenciaForm = false;
    } else {
      this.solicitudes = [];
      this.filteredSolicitudes = [];
    }
  }

  loadSolicitudes(): void {
    this.solicitudService.getAllSolicitudes().subscribe({
      next: (response) => {
        this.solicitudes = response.solicitudes;
        this.filteredSolicitudes = this.solicitudes;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar solicitudes:', error);
        Swal.fire('Error', 'Error al cargar las solicitudes', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  filterSolicitudesByRut(): void {
    if (!this.solicitudSearchRut) {
      this.filteredSolicitudes = this.solicitudes;
      return;
    }
    this.filteredSolicitudes = this.solicitudes.filter(solicitud => 
      solicitud.usuario?.rut?.toLowerCase().includes(this.solicitudSearchRut.toLowerCase())
    );
  }

  formatSolicitudSearchRut(event: any): void {
    let rut = event.target.value.replace(/[^0-9kK]/g, '');
    if (rut.length > 1) {
      rut = rut.slice(0, -1) + '-' + rut.slice(-1);
    }
    if (rut.length > 4) {
      rut = rut.slice(0, -5) + '.' + rut.slice(-5);
    }
    if (rut.length > 8) {
      rut = rut.slice(0, -9) + '.' + rut.slice(-9);
    }
    this.solicitudSearchRut = rut;
    this.filterSolicitudesByRut();
  }

  deleteSolicitud(id: number): void {
    Swal.fire({
      title: '¿Está seguro de que desea eliminar esta solicitud?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.solicitudService.deleteSolicitud(id).subscribe({
          next: () => {
            Swal.fire(
              '¡Eliminado!',
              'La solicitud ha sido eliminada.',
              'success'
            );
            this.loadSolicitudes(); // Recargar la lista de solicitudes
          },
          error: (error) => {
            console.error('Error al eliminar la solicitud:', error);
            Swal.fire(
              'Error',
              'Error al eliminar la solicitud',
              'error'
            );
          }
        });
      }
    });
  }

  viewDocuments(solicitud: Solicitud): void {
    if (!solicitud.documentos || solicitud.documentos.length === 0) {
      Swal.fire('Información', 'No hay documentos adjuntos a esta solicitud.', 'info');
      return;
    }

    const documentosList = solicitud.documentos.map((doc: any) => `
      <div class="mb-2">
        <strong>${doc.nombre}</strong><br>
        <button onclick="window.downloadDocument('${doc.url}', '${doc.nombre}')" class="btn btn-primary btn-sm mt-1">
          Descargar Documento
        </button>
      </div>
    `).join('');

    Swal.fire({
      title: 'Documentos Adjuntos',
      html: documentosList,
      width: '600px',
      showCloseButton: true,
      showConfirmButton: false,
      didOpen: () => {
        // Añadir la función de descarga al objeto window
        (window as any).downloadDocument = (url: string, nombre: string) => {
          const link = document.createElement('a');
          link.href = url;
          link.download = nombre;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
      }
    });
  }
} 