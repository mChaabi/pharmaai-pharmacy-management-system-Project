package pharmacie_backend.module.vente.entity;

import jakarta.persistence.*;
import lombok.*;
import pharmacie_backend.module.patient.entity.Patient;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

// Table "ventes" — une vente = une transaction complète
@Entity
@Table(name = "ventes")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Vente {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Patient associé (optionnel — vente anonyme possible)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    // Date et heure de la vente
    @Column(nullable = false)
    private LocalDateTime dateVente;

    // Lignes de la vente (les médicaments achetés)
    @OneToMany(mappedBy = "vente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneVente> lignes;

    // Montant total calculé
    @Column(nullable = false)
    private Double montantTotal;

    // Mode de paiement : ESPECES, CARTE, ASSURANCE
    private String modePaiement;

    // Statut : VALIDEE, ANNULEE, EN_ATTENTE
    private String statut;

    // Numéro de facture unique
    private String numeroFacture;

    // Référence ordonnance si applicable
    private String refOrdonnance;

    // Pharmacien qui a effectué la vente
    private String pharmacien;
}