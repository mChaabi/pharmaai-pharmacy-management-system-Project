import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MouvementStock, StockDashboard } from '../models/stock';

@Injectable({ providedIn: 'root' })
export class StockService {

    private api = 'http://localhost:8080/api/v1/stock';

    constructor(private http: HttpClient) {}

    // Réapprovisionner un médicament
    entreeStock(data: any): Observable<MouvementStock> {
        return this.http.post<MouvementStock>(`${this.api}/entree`, data);
    }

    // Ajustement manuel du stock
    ajuster(data: any): Observable<MouvementStock> {
        return this.http.put<MouvementStock>(`${this.api}/ajuster`, data);
    }

    // Historique des mouvements d'un médicament
    getHistorique(medicamentId: string): Observable<MouvementStock[]> {
        return this.http.get<MouvementStock[]>(
            `${this.api}/historique/${medicamentId}`);
    }

    // KPIs du stock pour le dashboard
    getDashboard(): Observable<StockDashboard> {
        return this.http.get<StockDashboard>(`${this.api}/dashboard`);
    }

    // Tous les mouvements
    getTousLesMouvements(): Observable<MouvementStock[]> {
        return this.http.get<MouvementStock[]>(`${this.api}/mouvements`);
    }
}
