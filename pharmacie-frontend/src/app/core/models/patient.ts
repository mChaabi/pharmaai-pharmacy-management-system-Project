export interface Patient {
    id?: string;
    nom: string;
    prenom: string;
    dateNaissance?: string;
    telephone?: string;
    email?: string;
    adresse?: string;
    sexe?: string;
    cin?: string;
    numeroAssurance?: string;
    allergies?: string;
    maladiesChroniques?: string;
    medecinTraitant?: string;
    dateInscription?: string;
}
