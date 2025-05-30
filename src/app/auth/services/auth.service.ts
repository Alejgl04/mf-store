import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { catchError, map, Observable, of, tap } from 'rxjs';

import { AuthResponse } from '@auth/interfaces/auth-response';
import { User } from '@auth/interfaces/user.interface';

import { environment } from '@environments/environment';


type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const baseUrl = environment.baseUrl;

@Injectable({providedIn: 'root'})
export class AuthService {

  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User|null>(null);
  private _token = signal<string|null>(this.getTokenFromLocalStorage());

  private http = inject(HttpClient);

  checkStatusResource = rxResource({
    loader: () => this.checkStatus()
  })

  authStatus = computed<AuthStatus>(() => {

    if ( this._authStatus() === 'checking') return 'checking';

    if ( this._user()) {
      return 'authenticated';
    }

    return 'not-authenticated';
  });

  user = computed<User|null>(() => this._user());
  token = computed(() => this._token());


  login(email: string, password: string): Observable<Boolean> {
    return this.http.post<AuthResponse>(`${baseUrl}/auth/login`, {
      email,
      password,
    }).pipe(
      map( resp => this.handleAuthentication(resp)),
      catchError(() => this.handleAuthError()),
    )
  }

  checkStatus(): Observable<Boolean> {
    const token = this.getTokenFromLocalStorage();
    if ( !token ) {
      this.logOut();
      return of(false);
    }

    return this.http.get<AuthResponse>(`${baseUrl}/auth/check-status`, {
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // }
    }).pipe(
      map( resp => this.handleAuthentication(resp)),
      catchError(() => this.handleAuthError()),
    )
  }

  logOut() {
    this._authStatus.set('not-authenticated');
    this._token.set(null);
    this._user.set(null);

    this.removeTokenFromLocalStorage();
  }

  private handleAuthentication( { token, user } : AuthResponse ) {
    this._user.set(user);
    this._token.set(token);
    this._authStatus.set('authenticated');

    this.saveLocalStorageToken(token);

    return true;
  }

  private handleAuthError() {
    this.logOut();
    return of(false);
  }

  private saveLocalStorageToken(token: string) {
    localStorage.setItem('token', token);
  }

  private getTokenFromLocalStorage() {
    return localStorage.getItem('token');
  }

  private removeTokenFromLocalStorage() {
    localStorage.removeItem('token');
  }

}
