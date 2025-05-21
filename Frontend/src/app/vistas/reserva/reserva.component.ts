import { Component, OnInit } from '@angular/core';
import { HorarioService } from '../../servicios/horario.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpClientModule } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-reserva',
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    HttpClientModule
  ],
  providers: [
    provideNativeDateAdapter() // Add the provider here
  ]
})
export class ReservaComponent implements OnInit {
  fechasDisponibles: string[] = [];
  horasDisponibles: string[] = [];
  fechaSeleccionada: string | null = null;
  horaSeleccionada: string | null = null;
  tiposLicencia: string[] = ['Clase B', 'Clase C']; 
  tipoLicenciaSeleccionado: string | null = null;

  constructor(private horarioService: HorarioService) {}

  ngOnInit() {
    this.horarioService.getFechasDisponibles().subscribe(fechas => {
      this.fechasDisponibles = fechas;
    });
  }

  onFechaChange(date: Date) {
    const fecha = this.formatDate(date);
    this.fechaSeleccionada = fecha;
    if (fecha) {
      this.horarioService.getHorasPorFecha(fecha).subscribe(horas => {
        this.horasDisponibles = horas;
      });
    } else {
      this.horasDisponibles = [];
    }
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
  this.fechaSeleccionada = null;
  this.horaSeleccionada = null;
  this.horasDisponibles = [];
  }

  onSubmit() {
  if (!this.tipoLicenciaSeleccionado || !this.fechaSeleccionada || !this.horaSeleccionada) {
    alert('Selecciona tipo de licencia, fecha y hora');
    return;
  }
  this.horarioService.registrarSolicitud({
    name: this.tipoLicenciaSeleccionado,
    fecha: this.fechaSeleccionada,
    hora: this.horaSeleccionada
  }).subscribe({
    next: () => alert('Reserva realizada con éxito'),
    error: (err) => alert('Error al reservar: ' + (err.error?.msg || 'Intenta de nuevo'))
  });
}
}