import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MasterAccessService {
  private readonly MASTER_ACCESS_KEY = 'masterAccessGranted';
  private masterAccessGranted = new BehaviorSubject<boolean>(this.getInitialState());

  constructor() { }

  private getInitialState(): boolean {
    return localStorage.getItem(this.MASTER_ACCESS_KEY) === 'true';
  }

  grantMasterAccess() {
    localStorage.setItem(this.MASTER_ACCESS_KEY, 'true');
    this.masterAccessGranted.next(true);
  }

  revokeMasterAccess() {
    localStorage.removeItem(this.MASTER_ACCESS_KEY);
    this.masterAccessGranted.next(false);
  }

  isMasterAccessGranted(): boolean {
    return this.getInitialState();
  }
} 