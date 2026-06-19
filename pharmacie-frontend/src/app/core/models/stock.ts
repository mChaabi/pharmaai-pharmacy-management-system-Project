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

// ✅ Noms identiques au JSON backend
export interface StockDashboard {
    stockCritique:      number;  // ← pas stockCritique
    totalMedicaments:   number;
    tauxDisponibilite:  number;
    valeurTotaleStock:  number;  // ← pas valeurTotaleStock
}
