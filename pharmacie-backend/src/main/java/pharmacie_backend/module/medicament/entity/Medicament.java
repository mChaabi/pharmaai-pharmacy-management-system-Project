package pharmacie_backend.module.medicament.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

// Entité JPA = table "medicaments" dans PostgreSQL
@Entity
@Table(name = "medicaments")
@Data           // Génère getters/setters automatiquement (Lombok)
@Builder        // Pattern Builder pour créer des objets facilement
@NoArgsConstructor
@AllArgsConstructor
public class Medicament {

    // Identifiant unique généré automatiquement
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Nom du médicament - obligatoire
    @Column(nullable = false)
    private String nom;

    // DCI = Dénomination Commune Internationale (ex: Paracétamol)
    private String dci;

    // Forme : comprimé, sirop, injection, etc.
    private String forme;

    // Dosage : 500mg, 1g, etc.
    private String dosage;

    // Catégorie : antibiotique, analgésique, etc.
    private String categorie;

    // Prix de vente en MAD
    @Column(nullable = false)
    private Double prixVente;

    // Prix d'achat (coût)
    private Double prixAchat;

    // Quantité en stock
    @Column(nullable = false)
    private Integer quantiteStock;

    // Seuil d'alerte : si stock < seuilAlerte → alerte rouge
    private Integer seuilAlerte;

    // Date d'expiration
    private LocalDate dateExpiration;

    // Code-barres du médicament
    private String codeBarres;

    // Nécessite une ordonnance ou pas
    private Boolean ordonnanceRequise;

    // Fabricant / Laboratoire
    private String fabricant;
}