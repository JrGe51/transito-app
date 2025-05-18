import { Routes } from '@angular/router';
import { NuevoComponent } from './vistas/nuevo/nuevo.component';
import { LoginComponent } from './vistas/login/login.component';
import { RegistrarseComponent } from './vistas/registrarse/registrarse.component';
import { EditarComponent } from './vistas/editar/editar.component';
import { ReservaComponent } from './vistas/reserva/reserva.component';
import { Reserva2Component } from './vistas/reserva2/reserva2.component';
import { Reserva3Component } from './vistas/reserva3/reserva3.component';
import { ConsultasComponent } from './vistas/consultas/consultas.component';
export const routes: Routes = [
  { path: 'nuevo', component: NuevoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registrarse', component: RegistrarseComponent },
  { path: 'editar', component: EditarComponent },
  { path: 'reserva', component: ReservaComponent },
  { path: 'reserva2', component: Reserva2Component },
  { path: 'reserva3', component: Reserva3Component },
  { path: 'consultas', component: ConsultasComponent },
  { path: '**', redirectTo: '/nuevo', pathMatch: 'full' }
]; 