import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable, catchError, map, throwError } from 'rxjs';
import { User } from '../interfaces/user';
import { Admin } from '../interfaces/admin';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private AppUrl: string;
  private APIUrl: string;
  private AdminAPIUrl: string;

  constructor(private http: HttpClient) {
    this.AppUrl = environment.apiUrl;
    this.APIUrl = 'api/user';
    this.AdminAPIUrl = 'api/admin';
  }
   
  signIn(user: User): Observable<any> {
    return this.http.post(`${this.AppUrl}${this.APIUrl}/register`, user);
  }

  logIn(credentials: { email: string, password: string }): Observable<{ token: string, isAdmin: boolean, user: any }> {
    // Si el email termina en @loespejoadmin.com, intentar login como admin primero
    if (credentials.email.endsWith('@loespejoadmin.com')) {
      return this.http.post<{ token: string, user: any }>(`${this.AppUrl}${this.AdminAPIUrl}/login`, credentials).pipe(
        map(response => ({
          token: response.token,
          isAdmin: true,
          user: response.user
        })),
        catchError(error => {
          return throwError(() => error);
        })
      );
    }

    // Si no es email de admin, intentar login normal
    return this.http.post<{ token: string, user: any }>(`${this.AppUrl}${this.APIUrl}/login`, credentials).pipe(
      map(response => ({
        token: response.token,
        isAdmin: false,
        user: response.user
      })),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
}
