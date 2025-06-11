import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../servicios/user.service';
import { map, Observable, of } from 'rxjs';
import { MasterAccessService } from '../servicios/master-access.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> => {
  const userService = inject(UserService);
  const router = inject(Router);
  const masterAccessService = inject(MasterAccessService);

  const targetUrl = state.url;
  const previousUrl = router.getCurrentNavigation()?.previousNavigation?.finalUrl?.toString() || '/';


  const publicRoutes = ['/nuevo', '/login', '/registrarse'];
  const allowedUserRoutes = ['/user-dashboard', '/reserva', '/reserva2', '/reserva3', '/consultas'];

  console.log('--- authGuard Debug (REESTRUCTURANDO LÓGICA DE ROLES) ---');
  console.log('URL de destino:', targetUrl);
  console.log('URL anterior:', previousUrl);
  console.log('-----------------------------------------------------');


  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user && user.isAdmin;
  const hasToken = !!localStorage.getItem('token');

  console.log('DEBUG AUTENTICACIÓN INICIAL:');
  console.log('hasToken:', hasToken);
  console.log('user (parsed from localStorage):', user);
  console.log('isAdmin:', isAdmin);


  if (targetUrl.includes('/registro-admin')) {
    console.log('Guard: Accediendo a /registro-admin.');
    

    const isFromMasterLoginFlow = previousUrl.includes('/login') && masterAccessService.isMasterAccessGranted();
    
    if (isFromMasterLoginFlow) {
      console.log('Guard: Acceso maestro concedido desde login. Permitido.');
      masterAccessService.revokeMasterAccess(); 
      return of(true);
    } else {
      console.log('Guard: Acceso maestro NO concedido o no viene del flujo de login maestro.');
      masterAccessService.revokeMasterAccess(); 
      
      if (hasToken) { 
        if (isAdmin) {
          console.log('Guard: Admin logueado intentando /registro-admin sin flujo maestro. Redirigiendo a /admin-dashboard.');
          router.navigate(['/admin-dashboard']);
        } else {
          console.log('Guard: Usuario normal logueado intentando /registro-admin. Redirigiendo a /user-dashboard.');
          router.navigate(['/user-dashboard']);
        }
      } else {
        console.log('Guard: Usuario no logueado intentando /registro-admin. Redirigiendo a /login.');
        router.navigate(['/login']);
      }
      return of(false);
    }
  }


  if (hasToken) {
    console.log('DEBUG AUTENTICACIÓN LOGUEADO:');
    console.log('targetUrl:', targetUrl);
    console.log('isAdmin:', isAdmin);



    if (publicRoutes.includes(targetUrl)) {
      console.log('Guard: Usuario autenticado en ruta pública. Evaluando redirección...');
      console.log('publicRoutes incluye targetUrl (' + targetUrl + '):', publicRoutes.includes(targetUrl));
      if (isAdmin) {
        console.log('Guard: Admin autenticado en ruta pública. Redirigiendo a /admin-dashboard.');
        router.navigate(['/admin-dashboard']);
      } else {
        console.log('Guard: Usuario normal autenticado en ruta pública. Redirigiendo a /user-dashboard.');
        router.navigate(['/user-dashboard']);
      }
      return of(false); 
    }


    if (isAdmin && targetUrl !== '/admin-dashboard') {
      console.log('Guard: Admin autenticado en ruta no-admin-dashboard. Redirigiendo a /admin-dashboard.');
      router.navigate(['/admin-dashboard']);
      return of(false);
    }

    if (!isAdmin && targetUrl === '/admin-dashboard') {
      console.log('Guard: Usuario normal autenticado en admin-dashboard. Redirigiendo a /user-dashboard.');
      router.navigate(['/user-dashboard']);
      return of(false);
    }


    if (!isAdmin && !allowedUserRoutes.includes(targetUrl)) {
      console.log('Guard: Usuario normal autenticado en ruta no permitida. Redirigiendo a /user-dashboard.');
      router.navigate(['/user-dashboard']);
      return of(false);
    }


    console.log('Guard: Usuario autenticado y ruta permitida. Permitido.');
    return of(true);
  }

 
  console.log('DEBUG AUTENTICACIÓN NO LOGUEADO:');
  console.log('targetUrl:', targetUrl);


  if (previousUrl.includes('/login') && targetUrl !== '/login') {
    if (targetUrl !== '/nuevo' && targetUrl !== '/registrarse') {
      console.log(`Guard: Usuario NO autenticado. Desde /login, acceso denegado a ${targetUrl}. Redirigiendo a /login.`);
      router.navigate(['/login']);
      return of(false);
    }
  }

  if (previousUrl.includes('/nuevo') && targetUrl !== '/nuevo') {
    if (targetUrl !== '/login' && targetUrl !== '/registrarse') {
      console.log(`Guard: Usuario NO autenticado. Desde /nuevo, acceso denegado a ${targetUrl}. Redirigiendo a /nuevo.`);
      router.navigate(['/nuevo']);
      return of(false);
    }
  }


  if (publicRoutes.includes(targetUrl)) {
    console.log('Guard: Usuario NO autenticado en ruta pública. Permitido.');
    return of(true);
  } else {

    console.log('Guard: Usuario NO autenticado en ruta protegida. Redirigiendo a /login.');
    router.navigate(['/login']);
    return of(false);
  }
};




