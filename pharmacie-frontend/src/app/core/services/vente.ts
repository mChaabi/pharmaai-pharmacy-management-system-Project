import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { Vente } from '../models/vente';

@Injectable({ providedIn: 'root' })
export class VenteService {

    private api = 'http://localhost:8080/api/v1/ventes';

    // ✅ Signal partagé : "une vente vient d'être créée"
    private venteCreee$ = new Subject<void>();
    venteCreeeObservable = this.venteCreee$.asObservable();

    constructor(private http: HttpClient) {}

    getAll(): Observable<Vente[]> {
        return this.http.get<Vente[]>(this.api);
    }

    create(v: Vente): Observable<Vente> {
        return this.http.post<Vente>(this.api, v).pipe(
            // ✅ Émet le signal après création réussie
            tap(() => this.venteCreee$.next())
        );
    }

    getByPatient(patientId: string): Observable<Vente[]> {
        return this.http.get<Vente[]>(`${this.api}/patient/${patientId}`);
    }

    annuler(id: string): Observable<Vente> {
        return this.http.put<Vente>(`${this.api}/${id}/annuler`, {}).pipe(
            tap(() => this.venteCreee$.next()) // ✅ Aussi après annulation
        );
    }

    getStatsJour(): Observable<any> {
        return this.http.get<any>(`${this.api}/stats/jour`);
    }
}
