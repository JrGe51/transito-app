import { Injectable, inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';

// Array compartido para rastrear las peticiones activas
const activeRequests: HttpRequest<unknown>[] = [];

export const LoadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const loadingService = inject(LoadingService);

  // Excluir solo GET a /solicitud o /solicitudes
  const url = req.url.toLowerCase();
  if (req.method === 'GET' && (url.includes('/solicitud') || url.includes('/solicitudes'))) {
    // No activar el spinner global para estas peticiones GET
    return next(req);
  }

  if (activeRequests.length === 0) {
    loadingService.show();
  }
  activeRequests.push(req);

  return next(req).pipe(
    finalize(() => {
      const index = activeRequests.indexOf(req);
      if (index > -1) {
        activeRequests.splice(index, 1);
      }
      if (activeRequests.length === 0) {
        loadingService.hide();
      }
    })
  );
}; 