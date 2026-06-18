import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiResponse {
    reponse: string;
    type: string;
    timestamp: string;
    dureeMs: number;
}

@Injectable({ providedIn: 'root' })
export class AiService {

    private api = 'http://localhost:8080/api/v1/ai';

    constructor(private http: HttpClient) {}

    // Question libre au pharmacien AI
    poserQuestion(question: string): Observable<AiResponse> {
        return this.http.post<AiResponse>(
            `${this.api}/question`, { question });
    }

    // Vérifier interactions médicamenteuses
    verifierInteractions(medicaments: string[]): Observable<AiResponse> {
        return this.http.post<AiResponse>(
            `${this.api}/interactions`, { medicaments });
    }

    // Analyser une ordonnance
    analyserOrdonnance(texte: string): Observable<AiResponse> {
        return this.http.post<AiResponse>(
            `${this.api}/ordonnance`, { texte, langue: 'fr' });
    }

    // Conseils posologie
    conseilsPosologie(medicament: string, contexte: string): Observable<AiResponse> {
        return this.http.post<AiResponse>(
            `${this.api}/posologie`, { medicament, contexte });
    }

    // Suggérer alternative
    suggererAlternative(medicament: string): Observable<AiResponse> {
        return this.http.post<AiResponse>(
            `${this.api}/alternative`, { medicament });
    }
}
