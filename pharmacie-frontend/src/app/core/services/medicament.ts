import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medicament } from '../models/medicament';


@Injectable({ providedIn: 'root' })
export class MedicamentService {

    // URL de base du backend Spring Boot
    private api = 'http://localhost:8080/api/v1/medicaments';

    constructor(private http: HttpClient) {}

    // Récupère tous les médicaments
    getAll(): Observable<Medicament[]> {
        return this.http.get<Medicament[]>(this.api);
    }

    // Récupère un médicament par ID
    getById(id: string): Observable<Medicament> {
        return this.http.get<Medicament>(`${this.api}/${id}`);
    }

    // Crée un nouveau médicament
    create(m: Medicament): Observable<Medicament> {
        return this.http.post<Medicament>(this.api, m);
    }

    // Modifie un médicament existant
    update(id: string, m: Medicament): Observable<Medicament> {
        return this.http.put<Medicament>(`${this.api}/${id}`, m);
    }

    // Supprime un médicament
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.api}/${id}`);
    }

    // Médicaments en stock critique
    getStockCritique(): Observable<Medicament[]> {
        return this.http.get<Medicament[]>(`${this.api}/alertes/stock-critique`);
    }

    // Médicaments qui expirent bientôt
    getExpirantBientot(): Observable<Medicament[]> {
        return this.http.get<Medicament[]>(`${this.api}/alertes/expiration`);
    }
}
