import { Routes } from '@angular/router';
import { LoginComponent } from './vistas/login/login.component';
import { NuevoComponent } from './vistas/nuevo/nuevo.component';
import { EditarComponent } from './vistas/editar/editar.component';
import { ReservaComponent } from './vistas/reserva/reserva.component';
import { Reserva2Component } from './vistas/reserva2/reserva2.component';
import { Reserva3Component } from './vistas/reserva3/reserva3.component';
import { ConsultasComponent } from './vistas/consultas/consultas.component';
export const routes: Routes = [
  { path: '', redirectTo: '/nuevo', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'nuevo', component: NuevoComponent },
  { path: 'editar', component: EditarComponent },
  { path: 'reserva', component: ReservaComponent },
  { path: 'reserva2', component: Reserva2Component },
  { path: 'reserva3', component: Reserva3Component },
  { path: 'consultas', component: ConsultasComponent }
]; 