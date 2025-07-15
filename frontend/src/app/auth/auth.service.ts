import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    email: string;
    nome?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem('auth_user', JSON.stringify(response.usuario));
          this.userSubject.next(response.usuario);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('auth_user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Verificar se o token não expirou
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  private loadStoredUser(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('auth_user');
    if (token && this.isAuthenticated() && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userSubject.next(user);
      } catch {
        this.logout();
      }
    }
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/forgot-password`, { email });
  }
}
