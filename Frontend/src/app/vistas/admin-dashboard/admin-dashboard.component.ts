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
import { Admin } from '../../interfaces/admin';
import { RutService } from '../../servicios/rut.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

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
  allHorarios: any[] = [];
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
  solicitudSearchDate: string = '';
  adminData: Admin | undefined;
  showCrearLicencia = false;
  
  filterFecha: string = '';
  filterLicencia: string = '';


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

  readonly TIPOS_LICENCIA = [
    'Clase B',
    'Clase C',
    'Clase D',
    'Clase F',
    'Clase A1',
    'Clase A2',
    'Clase A3',
    'Clase A4',
    'Clase A5'
  ];

  readonly TIPOS_DESCRIPCION = [
    'Licencia Profesional',
    'Licencia No Profesional',
    'Licencia Especial'
  ];

  validatingUser: User | null = null;
  validateDocsForm: FormGroup;
  userHasActiveSolicitud: boolean | null = null;
  solicitudActivaId: number | null = null;
  tipoLicenciaActiva: string | null = null;

  filterSolicitudSearchRut: string = '';

  // Propiedades para el modal de reagendamiento
  isRescheduleModalOpen = false;
  selectedSolicitud: Solicitud | null = null;
  availableHorarios: any[] = [];
  filteredAvailableHorarios: any[] = [];
  newHorarioId: number | null = null;
  rescheduleFilterDate: string = '';
  rescheduleFilterLicencia: string = '';

  constructor(
    private horarioService: HorarioService,
    private licenciaService: LicenciaService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastrService,
    private fb: FormBuilder,
    private solicitudService: SolicitudService,
    private rutService: RutService
  ) {
    this.minDate = this.getTomorrowDate();

    this.editUserForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      rut: ['', [Validators.required, this.rutValidator.bind(this)]],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)]],
      telefono: ['', Validators.required],
      fechanacimiento: ['', Validators.required],
      direccion: ['', Validators.required],
    });

    this.validateDocsForm = this.fb.group({
      examenMedicoAprobado: [false],
      examenPracticoAprobado: [false],
      examenTeoricoAprobado: [false],
      examenPsicotecnicoAprobado: [false],
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    }
    this.loadAdminData();
    this.loadLicencias();
    this.loadHorarios();
  }

  loadAdminData(): void {
    const adminString = localStorage.getItem('user');
    if (adminString) {
      try {
        const parsedData = JSON.parse(adminString);
        if (parsedData.isAdmin) {
          this.adminData = parsedData;
          this.cdr.markForCheck();
        } else {
          this.adminData = undefined;
          this.cdr.markForCheck();
        }
      } catch (e) {
        console.error('Error al parsear los datos del administrador de localStorage:', e);
        this.toast.error('Error al cargar los datos del administrador.', 'Error');
      }
    }
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
          this.allHorarios = data.map((horario: any) => ({
            ...horario,
            fecha: horario.fecha ? new Date(horario.fecha).toISOString().split('T')[0] : '',
            hora: horario.hora ? horario.hora.substring(0, 5) : '',
            tipoLicenciaMostrado: horario.licenciaName || 'N/A'
          }));
          this.horarios = [...this.allHorarios];
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

        let errorMessage = 'Error al crear el horario';
        if (error.error && error.error.msg) {
          errorMessage = error.error.msg;
        }

        // Mostrar SweetAlert con el mensaje específico del backend
        Swal.fire('Error', errorMessage, 'error');
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

  filterHorarios() {
    let filtered = [...this.allHorarios];

    if (this.filterFecha) {
      filtered = filtered.filter(horario => horario.fecha === this.filterFecha);
    }

    if (this.filterLicencia) {
      filtered = filtered.filter(horario => 
        horario.licenciaName && horario.licenciaName.toLowerCase() === this.filterLicencia.toLowerCase()
      );
    }
    this.horarios = filtered;
    this.cdr.detectChanges();
  }

  clearHorariosFilters() {
    this.filterFecha = '';
    this.filterLicencia = '';
    this.horarios = [...this.allHorarios];
    this.cdr.detectChanges();
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
      this.toast.error('Por favor complete todos los campos', 'error');
      return;
    }

    // Verificar si la licencia ya existe
    const licenciaExistente = this.licencias.find(
      lic => lic.name.toLowerCase() === this.nuevaLicencia.name.toLowerCase()
    );

    if (licenciaExistente) {
      Swal.fire('Error', 'Esta licencia ya existe en el sistema', 'error');
      return;
    }

    this.licenciaService.registerLicencia(this.nuevaLicencia).subscribe({
      next: (response: any) => {
        Swal.fire('¡Éxito!', 'Licencia creada exitosamente', 'success');
        this.loadLicencias();
        this.nuevaLicencia = { name: '', description: '' };
        this.showCreateLicenciaForm = false;
      },
      error: (error: any) => {
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
    if (this.showUsersManagement && this.users.length === 0) {
      this.loadUsers();
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
    const rut = event.target.value.replace(/[^0-9kK]/g, '');
    this.editUserForm.get('rut')?.setValue(this.rutService.formatRut(rut), { emitEvent: false });
  }

  formatSearchRut(event: any): void {
    let rut = event.target.value.replace(/[^0-9kK]/g, '');
    rut = this.rutService.formatRut(rut);
    this.userSearchRut = rut;
    this.filterUsersByRut();
    this.cdr.markForCheck();
  }

  logout(): void {
    this.userService.logout();
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
    if (this.solicitudSearchRut) {
      this.solicitudSearchRut = this.rutService.formatRut(this.solicitudSearchRut);
    }
    this.applySolicitudFilters();
  }

  loadSolicitudes(): void {
    this.solicitudService.getAllSolicitudes().subscribe({
      next: (data) => {
        // Ordenar por fecha y luego por hora de la cita
        const sortedData = data.solicitudes.sort((a, b) => {
          const dateTimeA = `${a.horario?.fecha || ''}T${a.horario?.hora || ''}`;
          const dateTimeB = `${b.horario?.fecha || ''}T${b.horario?.hora || ''}`;
          return dateTimeA.localeCompare(dateTimeB);
        });

        this.solicitudes = sortedData;
        this.filteredSolicitudes = sortedData;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error al cargar solicitudes:', err);
        this.solicitudes = [];
        this.filteredSolicitudes = [];
        this.cdr.markForCheck();
      }
    });
  }

  applySolicitudFilters(): void {
    let tempSolicitudes = [...this.solicitudes];

    // Filtrar por RUT
    if (this.solicitudSearchRut) {
      const cleanedSearchRut = this.solicitudSearchRut.replace(/\./g, '').replace(/-/g, '');
      tempSolicitudes = tempSolicitudes.filter(solicitud => {
        const cleanedSolicitudRut = solicitud.usuario?.rut?.replace(/\./g, '').replace(/-/g, '');
        return cleanedSolicitudRut?.includes(cleanedSearchRut);
      });
    }

    // Filtrar por Fecha de Cita
    if (this.solicitudSearchDate) {
      tempSolicitudes = tempSolicitudes.filter(solicitud => {
        if (!solicitud.horario?.fecha) return false;
        // La fecha de la cita viene en el objeto horario y puede ser un string o Date.
        // Se normaliza a un string YYYY-MM-DD para una comparación segura.
        const citaDateStr = new Date(solicitud.horario.fecha).toISOString().split('T')[0];
        return citaDateStr === this.solicitudSearchDate;
      });
    }

    this.filteredSolicitudes = tempSolicitudes;
  }

  clearSolicitudFilters(): void {
    this.solicitudSearchRut = '';
    this.solicitudSearchDate = '';
    this.applySolicitudFilters();
  }

  exportToExcel(): void {
    if (this.filteredSolicitudes.length === 0) {
      this.toast.info('No hay solicitudes para exportar en la vista actual.', 'Información');
      return;
    }

    const dataToExport = this.filteredSolicitudes.map(s => ({
      'ID': s.id,
      'Fecha Solicitud': s.fechaSolicitud ? new Date(s.fechaSolicitud).toLocaleDateString('es-CL', { timeZone: 'UTC' }) : 'N/A',
      'Tipo Trámite': s.tipoTramite,
      'Nombre Usuario': `${s.usuario?.name || ''} ${s.usuario?.lastname || ''}`,
      'RUT Usuario': s.usuario?.rut,
      'Email Usuario': s.usuario?.email,
      'Teléfono': s.usuario?.telefono,
      'Tipo Licencia': s.tipoLicencia?.name,
      'Fecha Cita': s.horario?.fecha ? new Date(s.horario.fecha).toLocaleDateString('es-CL', { timeZone: 'UTC' }) : 'N/A',
      'Hora Cita': s.horario?.hora ? s.horario.hora.substring(0, 5) : 'N/A'
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
    // Lógica para el nombre del archivo dinámico
    const currentDate = new Date().toISOString().split('T')[0];
    let fileName = 'reporte';

    const isRutFiltered = this.solicitudSearchRut.trim() !== '';
    const isDateFiltered = this.solicitudSearchDate.trim() !== '';
    
    let dateForFileName = currentDate; // Usar fecha actual por defecto

    if (isRutFiltered && isDateFiltered) {
      fileName += `_solicitudes_por_RUT_y_Fecha`;
      dateForFileName = this.solicitudSearchDate; // Usar fecha del filtro
    } else if (isRutFiltered) {
      fileName += `_solicitudes_por_RUT`;
    } else if (isDateFiltered) {
      fileName += `_solicitudes_por_Fecha`;
      dateForFileName = this.solicitudSearchDate; // Usar fecha del filtro
    } else {
      fileName += '_general_solicitudes';
    }

    fileName += `_${dateForFileName}.xlsx`;

    FileSaver.saveAs(data, fileName);
  }

  formatSolicitudSearchRut(event: any): void {
    let rut = event.target.value.replace(/[^0-9kK]/g, '');
    this.solicitudSearchRut = this.rutService.formatRut(rut);
    this.applySolicitudFilters();
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
            this.loadSolicitudes(); 
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
    // Mostrar SweetAlert de carga mientras se obtienen los documentos
    Swal.fire({
      title: 'Cargando documentos...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.solicitudService.getSolicitudById(solicitud.id!).subscribe({
      next: (response) => {
        Swal.close(); // Cerrar el SweetAlert de carga

        const solicitudConDocumentos = response.solicitud;

        if (!solicitudConDocumentos.documentos || solicitudConDocumentos.documentos.length === 0) {
          Swal.fire('Información', 'No hay documentos adjuntos a esta solicitud.', 'info');
          return;
        }

        const documentosList = solicitudConDocumentos.documentos.map((doc: any) => `
          <div class="mb-2">
            <strong>${doc.nombre}</strong><br>
            <button onclick="window.downloadDocument('${doc.contenido}', '${doc.nombre}')" class="btn btn-primary btn-sm mt-1">
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
      },
      error: (error) => {
        Swal.close(); // Cerrar el SweetAlert de carga en caso de error
        console.error('Error al obtener los documentos de la solicitud:', error);
        Swal.fire('Error', 'Error al cargar los documentos de la solicitud.', 'error');
      }
    });
  }

  // Validador personalizado para RUT
  rutValidator(control: any) {
    if (!control.value) {
      return null;
    }
    
    if (!this.rutService.validarRut(control.value)) {
      return { invalidRut: true };
    }
    
    return null;
  }

  openValidateDocs(user: User): void {
    this.validatingUser = { ...user };
    this.userHasActiveSolicitud = null;
    this.solicitudActivaId = null;
    this.tipoLicenciaActiva = null;
    this.validateDocsForm.patchValue({
      examenMedicoAprobado: !!user.examenMedicoAprobado,
      examenPracticoAprobado: !!user.examenPracticoAprobado,
      examenTeoricoAprobado: !!user.examenTeoricoAprobado,
      examenPsicotecnicoAprobado: !!user.examenPsicotecnicoAprobado,
    });
    this.cdr.markForCheck();
    
    // Verificar si el usuario tiene licencia vigente
    const hasActiveLicense = !!(user.licenciaVigente && Array.isArray(user.licenciaVigente) && user.licenciaVigente.length > 0);
    
    if (user.id) {
      this.userService.hasActiveSolicitud(user.id).subscribe({
        next: (res) => {
          this.userHasActiveSolicitud = res.hasActive;
          
          // Habilitar formulario si tiene solicitud activa O licencia vigente
          if (res.hasActive || hasActiveLicense) {
            this.validateDocsForm.enable();
            
            if (res.hasActive) {
              // Obtener la solicitud activa para el usuario
              this.solicitudService.getAllSolicitudes().subscribe({
                next: (data) => {
                  // Buscar la solicitud activa del usuario
                  const solicitud = data.solicitudes.find((s: any) => s.id_usuario === user.id);
                  if (solicitud) {
                    this.solicitudActivaId = typeof solicitud.id === 'number' ? solicitud.id : null;
                    this.tipoLicenciaActiva = solicitud.tipoLicencia?.name || null;
                  }
                  this.cdr.markForCheck();
                },
                error: () => {
                  this.solicitudActivaId = null;
                  this.tipoLicenciaActiva = null;
                  this.cdr.markForCheck();
                }
              });
            }
          } else {
            this.validateDocsForm.disable();
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.userHasActiveSolicitud = false;
          // Si no hay solicitud activa pero tiene licencia vigente, habilitar formulario
          if (hasActiveLicense) {
            this.validateDocsForm.enable();
          } else {
            this.validateDocsForm.disable();
          }
          this.cdr.markForCheck();
        }
      });
    } else {
      this.userHasActiveSolicitud = false;
      // Si no hay solicitud activa pero tiene licencia vigente, habilitar formulario
      if (hasActiveLicense) {
        this.validateDocsForm.enable();
      } else {
        this.validateDocsForm.disable();
      }
      this.cdr.markForCheck();
    }
  }

  saveValidatedDocs(): void {
    // Verificar si el usuario tiene licencia vigente
    const hasActiveLicense = !!(this.validatingUser?.licenciaVigente && Array.isArray(this.validatingUser.licenciaVigente) && this.validatingUser.licenciaVigente.length > 0);
    
    // Permitir guardar si tiene solicitud activa O licencia vigente
    if ((this.userHasActiveSolicitud || hasActiveLicense) && this.validatingUser) {
      const updatedFields = this.validateDocsForm.value;
      const allTrue = updatedFields.examenMedicoAprobado && updatedFields.examenPracticoAprobado && updatedFields.examenTeoricoAprobado && updatedFields.examenPsicotecnicoAprobado;
      let updatedUser: User = {
        ...this.validatingUser,
        ...updatedFields,
      };
      
      // Solo actualizar licenciaVigente si tiene solicitud activa y todos los exámenes están aprobados
      if (allTrue && this.userHasActiveSolicitud && this.tipoLicenciaActiva) {
        const licenciasActuales = this.validatingUser.licenciaVigente || [];
        updatedUser.licenciaVigente = [...licenciasActuales, this.tipoLicenciaActiva];
      }
      
      this.userService.updateUser(updatedUser.id!, updatedUser).subscribe({
        next: () => {
          // Solo eliminar solicitud si tiene solicitud activa y todos los exámenes están aprobados
          if (allTrue && this.userHasActiveSolicitud && this.solicitudActivaId) {
            this.solicitudService.deleteSolicitud(this.solicitudActivaId).subscribe({
              next: () => {
                Swal.fire('¡Éxito!', 'Documentos validados y licencia otorgada. Solicitud eliminada.', 'success');
                this.loadUsers();
                this.cancelValidateDocs();
              },
              error: () => {
                Swal.fire('¡Éxito!', 'Documentos validados y licencia otorgada, pero no se pudo eliminar la solicitud.', 'warning');
                this.loadUsers();
                this.cancelValidateDocs();
              }
            });
          } else {
            const message = hasActiveLicense ? 
              'Documentos validados correctamente para usuario con licencia vigente' : 
              'Documentos validados correctamente';
            Swal.fire('¡Éxito!', message, 'success');
            this.loadUsers();
            this.cancelValidateDocs();
          }
        },
        error: (error) => {
          console.error('Error al validar documentos:', error);
          Swal.fire('Error', 'No se pudo validar los documentos', 'error');
        }
      });
    }
  }

  cancelValidateDocs(): void {
    this.validatingUser = null;
    this.userHasActiveSolicitud = null;
    this.solicitudActivaId = null;
    this.tipoLicenciaActiva = null;
    this.validateDocsForm.reset();
    this.cdr.markForCheck();
  }

  // Función para verificar si el usuario tiene licencia vigente (para el template)
  tieneLicenciaVigente(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return !!(user.licenciaVigente && Array.isArray(user.licenciaVigente) && user.licenciaVigente.length > 0);
  }

  // Función helper para verificar si es array (para el template)
  esArray(valor: any): boolean {
    return Array.isArray(valor);
  }

  // Función helper para verificar si tiene licencias (para el template)
  tieneLicencias(user: User): boolean {
    return !!(user.licenciaVigente && Array.isArray(user.licenciaVigente) && user.licenciaVigente.length > 0);
  }

  // Función para quitar una licencia específica
  quitarLicencia(user: User, licencia: string): void {
    if (!user.id) {
      this.toast.error('Error: ID de usuario no válido', 'Error');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas quitar la licencia "${licencia}" al usuario ${user.name} ${user.lastname}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, quitar licencia',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.quitarLicencia(user.id!, licencia).subscribe({
          next: (response) => {
            Swal.fire(
              '¡Licencia removida!',
              `La licencia "${licencia}" ha sido removida del usuario ${user.name} ${user.lastname}.`,
              'success'
            );
            // Recargar la lista de usuarios
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error al quitar licencia:', error);
            Swal.fire(
              'Error',
              'No se pudo quitar la licencia. Inténtalo de nuevo.',
              'error'
            );
          }
        });
      }
    });
  }

  // Función para mostrar las licencias de un usuario
  mostrarLicenciasUsuario(user: User): string {
    if (user.licenciaVigente && Array.isArray(user.licenciaVigente) && user.licenciaVigente.length > 0) {
      return user.licenciaVigente.join(', ');
    }
    return 'sin licencia';
  }

  openRescheduleModal(solicitud: Solicitud): void {
    this.selectedSolicitud = solicitud;
    this.isRescheduleModalOpen = true;
    this.horarioService.getAllHorarios().subscribe((data: any) => {
      // Filtrar solo horarios con cupo disponible y en el futuro
      this.availableHorarios = data.filter((h: any) => h.cupodisponible && new Date(h.fecha) >= new Date());
      this.applyRescheduleFilters(); // Aplicar filtros al abrir
      this.cdr.markForCheck();
    });
  }

  closeRescheduleModal(): void {
    this.isRescheduleModalOpen = false;
    this.selectedSolicitud = null;
    this.availableHorarios = [];
    this.newHorarioId = null;
    this.clearRescheduleFilters(); // Limpiar filtros al cerrar
    this.cdr.markForCheck();
  }

  applyRescheduleFilters(): void {
    let filtered = [...this.availableHorarios];
    if (this.rescheduleFilterDate) {
      filtered = filtered.filter(h => h.fecha === this.rescheduleFilterDate);
    }
    if (this.rescheduleFilterLicencia) {
      filtered = filtered.filter(h => h.licenciaName === this.rescheduleFilterLicencia);
    }
    this.filteredAvailableHorarios = filtered;
    this.cdr.markForCheck();
  }

  clearRescheduleFilters(): void {
    this.rescheduleFilterDate = '';
    this.rescheduleFilterLicencia = '';
    this.applyRescheduleFilters();
  }

  confirmReschedule(): void {
    if (this.newHorarioId && this.selectedSolicitud?.id) {
      Swal.fire({
        title: 'Reagendando...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      this.solicitudService.rescheduleSolicitud(this.selectedSolicitud.id, this.newHorarioId).subscribe({
        next: () => {
          this.loadSolicitudes();
          Swal.fire('¡Éxito!', 'La cita ha sido reagendada correctamente.', 'success').then(() => {
            this.closeRescheduleModal();
          });
        },
        error: (err: any) => {
          console.error('Error al reagendar la cita:', err);
          Swal.fire('Error', 'No se pudo reagendar la cita.', 'error');
        }
      });
    } else {
      this.toast.error('Debe seleccionar un nuevo horario.', 'Error');
    }
  }
} 