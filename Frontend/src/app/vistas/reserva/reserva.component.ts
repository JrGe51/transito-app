import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { HorarioService } from '../../servicios/horario.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpClientModule } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-reserva',
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.css'],
  providers: [provideNativeDateAdapter()],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    HttpClientModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservaComponent implements OnInit {
  fechasDisponibles: string[] = [];
  horasDisponibles: string[] = [];
  fechaSeleccionada: Date | null = null;
  horaSeleccionada: string | null = null;
  tiposLicencia: string[] = ['Clase B', 'Clase C']; 
  tipoLicenciaSeleccionado: string | null = null;
  licenciaSeleccionada: boolean = false;

  constructor(private horarioService: HorarioService) {}

  ngOnInit() {
    this.horarioService.getFechasDisponibles().subscribe(fechas => {
      this.fechasDisponibles = fechas;
    });
  }

  onFechaChange(date: Date | null) {
    if (!date) {
      this.fechaSeleccionada = null;
      this.horaSeleccionada = null;
      this.horasDisponibles = [];
      console.log('Fecha deseleccionada');
      return;
    }
    this.fechaSeleccionada = date;
    this.horaSeleccionada = null;
    const fechaString = this.formatDate(date);
    console.log('Fecha seleccionada:', fechaString);
    
    this.horarioService.getHorasPorFecha(fechaString).subscribe({
      next: (horas) => {
        console.log('Horas disponibles:', horas);
        this.horasDisponibles = horas;
      },
      error: (error) => {
        console.error('Error al obtener horas:', error);
        this.horasDisponibles = [];
      }
    });
  }

  formatDate(date: Date): string {
    // Convierte Date a 'YYYY-MM-DD'
    return date.toISOString().split('T')[0];
  }

  dateClass = (d: Date) => {
    const dateString = this.formatDate(d);
    return this.fechasDisponibles.includes(dateString) ? 'fecha-disponible' : '';
  };

  filtrarFechasDisponibles = (date: Date | null): boolean => {
    if (!date) return false;
    const dateString = this.formatDate(date);
    return this.fechasDisponibles.includes(dateString);
  }

  seleccionarTipoLicencia(tipo: string) {
    this.tipoLicenciaSeleccionado = tipo;
    this.licenciaSeleccionada = true;
    this.fechaSeleccionada = null;
    this.horaSeleccionada = null;
    this.horasDisponibles = [];
    console.log('Tipo de licencia seleccionado:', tipo);
  }

  onSubmit() {
    if (!this.tipoLicenciaSeleccionado) {
      alert('Por favor, selecciona un tipo de licencia');
      return;
    }
    if (!this.fechaSeleccionada) {
      alert('Por favor, selecciona una fecha');
      return;
    }
    if (!this.horaSeleccionada) {
      alert('Por favor, selecciona una hora');
      return;
    }

    const solicitud = {
      name: this.tipoLicenciaSeleccionado,
      fecha: this.formatDate(this.fechaSeleccionada),
      hora: this.horaSeleccionada
    };

    console.log('Enviando solicitud:', solicitud);

    this.horarioService.registrarSolicitud(solicitud).subscribe({
      next: () => {
        alert('Reserva realizada con éxito');
        // Limpiar el formulario después de una reserva exitosa
        this.tipoLicenciaSeleccionado = null;
        this.licenciaSeleccionada = false;
        this.fechaSeleccionada = null;
        this.horaSeleccionada = null;
        this.horasDisponibles = [];
      },
      error: (err) => {
        console.error('Error al reservar:', err);
        alert('Error al reservar: ' + (err.error?.msg || 'Intenta de nuevo'));
      }
    });
  }
}