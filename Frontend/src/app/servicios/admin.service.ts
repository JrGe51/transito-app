import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Admin } from '../interfaces/admin';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private AppUrl: string;
  private APIUrl: string;

  constructor(private http: HttpClient) {
    this.AppUrl = environment.apiUrl;
    this.APIUrl = 'api/admin';
  }


  checkMasterCredentials(email: string, password: string): Observable<any> {
    return this.http.post(`${this.AppUrl}${this.APIUrl}/check-master`, { email, password });
  }


  registerAdmin(admin: Admin): Observable<any> {
    return this.http.post(`${this.AppUrl}${this.APIUrl}/register`, admin);
  }


  loginAdmin(admin: Admin): Observable<string> {
    return this.http.post<string>(`${this.AppUrl}${this.APIUrl}/login`, admin);
  }
} 