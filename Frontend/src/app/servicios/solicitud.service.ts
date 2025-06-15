import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Solicitud } from '../interfaces/solicitud';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private AppUrl: string;
  private APIUrl: string;

  constructor(private http: HttpClient) {
    this.AppUrl = environment.apiUrl;
    this.APIUrl = 'api/solicitud';
  }

  getSolicitudesByUser(userId: number): Observable<{ solicitudes: Solicitud[] }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<{ solicitudes: Solicitud[] }>(`${this.AppUrl}${this.APIUrl}/byUser`, { headers: headers });
  }

  getAllSolicitudes(): Observable<{ solicitudes: Solicitud[] }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<{ solicitudes: Solicitud[] }>(`${this.AppUrl}${this.APIUrl}/all`, { headers: headers });
  }

  deleteSolicitud(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete(`${this.AppUrl}${this.APIUrl}/delete/${id}`, { headers: headers });
  }

  getSolicitudById(id: number): Observable<{ solicitud: Solicitud }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<{ solicitud: Solicitud }>(`${this.AppUrl}${this.APIUrl}/${id}`, { headers: headers });
  }
} 