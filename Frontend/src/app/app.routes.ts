import { Routes } from '@angular/router';
import { NuevoComponent } from './vistas/nuevo/nuevo.component';
import { LoginComponent } from './vistas/login/login.component';
import { RegistrarseComponent } from './vistas/registrarse/registrarse.component';
import { EditarComponent } from './vistas/editar/editar.component';
import { ReservaComponent } from './vistas/reserva/reserva.component';
import { Reserva2Component } from './vistas/reserva2/reserva2.component';
import { Reserva3Component } from './vistas/reserva3/reserva3.component';
import { ConsultasComponent } from './vistas/consultas/consultas.component';
import { RegistroAdminComponent } from './vistas/registro-admin/registro-admin.component';
import { AdminDashboardComponent } from './vistas/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './vistas/user-dashboard/user-dashboard.component';
import { RecuperarPasswordComponent } from './vistas/recuperar-password/recuperar-password.component';
import { VerificarCodigoComponent } from './vistas/verificar-codigo/verificar-codigo.component';
import { NuevaPasswordComponent } from './vistas/nueva-password/nueva-password.component';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path: 'nuevo', component: NuevoComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, canActivate: [authGuard] },
  { path: 'registrarse', component: RegistrarseComponent, canActivate: [authGuard] },
  { path: 'registro-admin', component: RegistroAdminComponent, canActivate: [authGuard] },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: 'user-dashboard', component: UserDashboardComponent, canActivate: [authGuard] },
  { path: 'editar', component: EditarComponent, canActivate: [authGuard] },
  { path: 'reserva', component: ReservaComponent, canActivate: [authGuard] },
  { path: 'reserva2', component: Reserva2Component, canActivate: [authGuard] },
  { path: 'reserva3', component: Reserva3Component, canActivate: [authGuard] },
  { path: 'consultas', component: ConsultasComponent, canActivate: [authGuard] },
  { path: 'recuperar-password', component: RecuperarPasswordComponent, canActivate: [authGuard] },
  { path: 'verificar-codigo', component: VerificarCodigoComponent, canActivate: [authGuard] },
  { path: 'nueva-password', component: NuevaPasswordComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/nuevo', pathMatch: 'full' }
]; 