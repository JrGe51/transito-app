import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private AppUrl:  string;
  private APIUrl:  string;
  constructor(private http: HttpClient) {
    this.AppUrl = environment.apiUrl
    this.APIUrl = 'api/user'
   }
   
  signIn(user: User): Observable<any>{
    return this.http.post(`${this.AppUrl}${this.APIUrl}/register`, user)
   }
  logIn(user: User): Observable<string>{
    return this.http.post<string>(`${this.AppUrl}${this.APIUrl}/login`, user)
  }
}
