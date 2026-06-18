export interface LigneVente {
    id?: string;
    medicamentId: string;
    medicamentNom?: string;
    quantite: number;
    prixUnitaire?: number;
    sousTotal?: number;
}

export interface Vente {
    id?: string;
    patientId?: string;
    patientNom?: string;
    dateVente?: string;
    lignes: LigneVente[];
    montantTotal?: number;
    modePaiement: string;
    statut?: string;
    numeroFacture?: string;
    refOrdonnance?: string;
    pharmacien?: string;
}
