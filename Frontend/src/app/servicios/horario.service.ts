import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HorarioService {
  private apiUrl = 'http://localhost:3017/api/horario';

  constructor(private http: HttpClient) { }

  getFechasDisponibles(licenciaName: string): Observable<string[]> {
    const params = new HttpParams().set('name', licenciaName);
    return this.http.get<string[]>(`${this.apiUrl}/fechas`, { params });
  }

  getHorasPorFecha(fecha: string, licenciaName: string): Observable<string[]> {
    const params = new HttpParams().set('fecha', fecha).set('name', licenciaName);
    return this.http.get<string[]>(`${this.apiUrl}/horas`, { params });
  }

  registrarSolicitud(solicitud: any): Observable<any> {
    const solicitudApiUrl = 'http://localhost:3017/api/solicitud';
    
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${solicitudApiUrl}/register`, solicitud, { headers });
  }
}