package pharmacie_backend.module.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

// Table "patients" dans PostgreSQL
@Entity
@Table(name = "patients")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Informations personnelles
    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    private LocalDate dateNaissance;
    private String telephone;
    private String email;
    private String adresse;

    // Sexe : M / F
    private String sexe;

    // Numéro CIN ou CNI
    private String cin;

    // Numéro d'assurance maladie
    private String numeroAssurance;

    // Allergies connues (texte libre)
    @Column(columnDefinition = "TEXT")
    private String allergies;

    // Maladies chroniques (diabète, HTA, etc.)
    @Column(columnDefinition = "TEXT")
    private String maladiesChroniques;

    // Médecin traitant
    private String medecinTraitant;

    // Date d'inscription à la pharmacie
    private LocalDate dateInscription;
}