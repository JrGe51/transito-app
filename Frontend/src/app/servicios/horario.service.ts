import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HorarioService {
  private apiUrl = 'http://localhost:3017/api/horario';

  constructor(private http: HttpClient) {}

  getFechasDisponibles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/fechas`);
  }

  getHorasPorFecha(fecha: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/horas?fecha=${fecha}`);
  }

  registrarSolicitud(data: { name: string, fecha: string, hora: string }) {
  // Usa el endpoint protegido con JWT si corresponde
  return this.http.post('http://localhost:3017/api/solicitud/register', data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}` // O donde guardes tu JWT
    }
  });
}
}