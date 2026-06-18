import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vente } from '../models/vente';

@Injectable({ providedIn: 'root' })
export class VenteService {

    private api = 'http://localhost:8080/api/v1/ventes';

    constructor(private http: HttpClient) {}

    getAll(): Observable<Vente[]> {
        return this.http.get<Vente[]>(this.api);
    }

    getById(id: string): Observable<Vente> {
        return this.http.get<Vente>(`${this.api}/${id}`);
    }

    create(v: Vente): Observable<Vente> {
        return this.http.post<Vente>(this.api, v);
    }

    // Historique des ventes d'un patient
    getByPatient(patientId: string): Observable<Vente[]> {
        return this.http.get<Vente[]>(`${this.api}/patient/${patientId}`);
    }

    // Annuler une vente
    annuler(id: string): Observable<Vente> {
        return this.http.put<Vente>(`${this.api}/${id}/annuler`, {});
    }

    // Stats du jour pour le dashboard
    getStatsJour(): Observable<any> {
        return this.http.get<any>(`${this.api}/stats/jour`);
    }
}
