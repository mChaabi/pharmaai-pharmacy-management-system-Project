import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest } from '../models/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private api = 'http://localhost:8080/api/v1/auth';

    // ✅ Détecte si on est dans le navigateur ou côté serveur
    private platformId = inject(PLATFORM_ID);
    private isBrowser = isPlatformBrowser(this.platformId);

    constructor(private http: HttpClient, private router: Router) {}

    login(data: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.api}/login`, data).pipe(
            tap(response => {
                // ✅ Sauvegarde seulement si on est dans le navigateur
                if (this.isBrowser) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response));
                }
            })
        );
    }

    logout(): void {
        if (this.isBrowser) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        // ✅ Retourne null côté serveur, pas d'erreur
        if (!this.isBrowser) return null;
        return localStorage.getItem('token');
    }

    getUser(): AuthResponse | null {
        if (!this.isBrowser) return null;
        const data = localStorage.getItem('user');
        return data ? JSON.parse(data) : null;
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    isAdmin(): boolean {
        return this.getUser()?.role === 'ADMIN';
    }
}
