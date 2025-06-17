import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';

export const passwordRecoveryGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const targetUrl = state.url;
  const previousUrl = document.referrer;

  // Si intenta acceder a recuperar-password
  if (targetUrl === '/recuperar-password') {
    // Solo permitir acceso desde el login
    if (!previousUrl || !previousUrl.includes('/login')) {
      router.navigate(['/login']);
      return of(false);
    }
    return of(true);
  }

  // Si intenta acceder a verificar-codigo
  if (targetUrl === '/verificar-codigo') {
    // Solo permitir acceso desde recuperar-password
    if (!previousUrl || !previousUrl.includes('/recuperar-password')) {
      router.navigate(['/recuperar-password']);
      return of(false);
    }
    return of(true);
  }

  // Si intenta acceder a nueva-password
  if (targetUrl === '/nueva-password') {
    // Verificar que venga de verificar-codigo y tenga el código
    const queryParams = route.queryParams;
    if (!previousUrl || !previousUrl.includes('/verificar-codigo') || !queryParams['codigo']) {
      router.navigate(['/verificar-codigo']);
      return of(false);
    }
    return of(true);
  }

  return of(false);
}; 