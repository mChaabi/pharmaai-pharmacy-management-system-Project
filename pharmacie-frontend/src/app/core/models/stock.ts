export interface MouvementStock {
    id?: string;
    medicamentId: string;
    type: string;
    quantite: number;
    stockAvant?: number;
    stockApres?: number;
    dateMouvement?: string;
    motif?: string;
    refCommande?: string;
    utilisateur?: string;
}

export interface StockDashboard {
    totalMedicaments: number;
    stockCritique: number;
    valeurTotaleStock: number;
    tauxDisponibilite: number;
}
