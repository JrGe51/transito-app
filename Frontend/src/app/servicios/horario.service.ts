import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HorarioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getFechasDisponibles(licenciaName: string): Observable<string[]> {
    const params = new HttpParams().set('name', licenciaName);
    return this.http.get<string[]>(`${this.apiUrl}api/horario/fechas`, { params });
  }

  getHorasPorFecha(fecha: string, licenciaName: string): Observable<string[]> {
    const params = new HttpParams().set('fecha', fecha).set('name', licenciaName);
    return this.http.get<string[]>(`${this.apiUrl}api/horario/horas`, { params });
  }

  registrarSolicitud(solicitud: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.apiUrl}api/solicitud/register`, solicitud, { headers });
  }

  getAllHorarios(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}api/horario/all`, { headers });
  }

  registerHorario(horarioData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.apiUrl}api/horario/register`, horarioData, { headers });
  }

  eliminarHorario(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}api/horario/${id}`, { headers });
  }

  getLicencias(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}api/licencia/all`, { headers });
  }
}