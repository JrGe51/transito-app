import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _loading = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this._loading.asObservable();

  show() {
    if (!this.isSweetAlertLoadingOpen()) {
      this._loading.next(true);
    }
  }

  hide() {
    this._loading.next(false);
  }

  // Detecta si hay un SweetAlert de carga abierto
  private isSweetAlertLoadingOpen(): boolean {
    // Busca el contenedor de SweetAlert y el spinner de carga
    const swalContainer = document.querySelector('.swal2-container');
    if (swalContainer) {
      // Busca el spinner de carga de SweetAlert
      const spinner = swalContainer.querySelector('.swal2-loader, .swal2-loading, .swal2-icon.swal2-loading');
      // Si existe el spinner, es un SweetAlert de carga
      return !!spinner;
    }
    return false;
  }
} 