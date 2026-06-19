package pharmacie_backend.module.auth.entity;

// Les 2 rôles de l'application
public enum Role {
    ADMIN,      // Accès complet : gestion users, tout voir/modifier
    PHARMACIEN  // Accès limité : ventes, patients, médicaments
}