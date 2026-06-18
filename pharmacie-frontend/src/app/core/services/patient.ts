import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { Patient } from '../models/patient';

@Injectable({ providedIn: 'root' })
export class PatientService {

    // ✅ Vérifie que l'URL est correcte
    private api = 'http://localhost:8080/api/v1/patients';

    constructor(private http: HttpClient) {}

    getAll(): Observable<Patient[]> {
        return this.http.get<Patient[]>(this.api).pipe(
            // ✅ Log pour déboguer
            tap(data => console.log('[PatientService] données:', data)),
            catchError(this.handleError)
        );
    }

    getById(id: string): Observable<Patient> {
        return this.http.get<Patient>(`${this.api}/${id}`)
            .pipe(catchError(this.handleError));
    }

    create(p: Patient): Observable<Patient> {
        return this.http.post<Patient>(this.api, p)
            .pipe(catchError(this.handleError));
    }

    update(id: string, p: Patient): Observable<Patient> {
        return this.http.put<Patient>(`${this.api}/${id}`, p)
            .pipe(catchError(this.handleError));
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.api}/${id}`)
            .pipe(catchError(this.handleError));
    }

    rechercher(q: string): Observable<Patient[]> {
        return this.http.get<Patient[]>(
            `${this.api}/recherche?q=${q}`)
            .pipe(catchError(this.handleError));
    }

    // ✅ Gestion centralisée des erreurs
    private handleError(error: HttpErrorResponse) {
        console.error('[PatientService] Erreur:', error);
        return throwError(() => error);
    }
}
