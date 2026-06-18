// Correspond exactement au MedicamentDTO du backend
export interface Medicament {
    id?: string;
    nom: string;
    dci?: string;
    forme?: string;
    dosage?: string;
    categorie?: string;
    prixVente: number;
    prixAchat?: number;
    quantiteStock: number;
    seuilAlerte?: number;
    dateExpiration?: string;
    codeBarres?: string;
    ordonnanceRequise?: boolean;
    fabricant?: string;
}
