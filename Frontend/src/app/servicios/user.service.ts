import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable, BehaviorSubject, catchError, map, throwError } from 'rxjs';
import { User } from '../interfaces/user';
import { Admin } from '../interfaces/admin';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private AppUrl: string;
  private APIUrl: string;
  private AdminAPIUrl: string;
  public isLoggedIn$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.AppUrl = environment.apiUrl;
    this.APIUrl = 'api/user';
    this.AdminAPIUrl = 'api/admin';
    this.checkLoginStatus();
  }

  private checkLoginStatus() {
    const token = localStorage.getItem('token');
    this.isLoggedIn$.next(!!token);
  }
   
  signIn(user: User): Observable<any> {
    return this.http.post(`${this.AppUrl}${this.APIUrl}/register`, user);
  }

  logIn(credentials: { email: string, password: string }): Observable<{ token: string, isAdmin: boolean, user: any }> {

    if (credentials.email.endsWith('@loespejoadmin.com')) {
      return this.http.post<{ token: string, user?: any }>(`${this.AppUrl}${this.AdminAPIUrl}/login`, credentials).pipe(
        map(response => {
          const userDetails = response.user || {}; 
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify({ ...userDetails, isAdmin: true }));
          this.isLoggedIn$.next(true);
          return {
            token: response.token,
            isAdmin: true,
            user: { ...userDetails, isAdmin: true } 
          };
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
    }


    return this.http.post<{ token: string, user?: any }>(`${this.AppUrl}${this.APIUrl}/login`, credentials).pipe(
      map(response => {
        const userDetails = response.user || {}; 
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({ ...userDetails, isAdmin: false }));
        this.isLoggedIn$.next(true);
        return {
          token: response.token,
          isAdmin: false,
          user: { ...userDetails, isAdmin: false } 
        };
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn$.next(false);
  }
}
