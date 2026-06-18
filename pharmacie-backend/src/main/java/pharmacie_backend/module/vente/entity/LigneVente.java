package pharmacie_backend.module.vente.entity;

import jakarta.persistence.*;
import lombok.*;
import pharmacie_backend.module.medicament.entity.Medicament;
import pharmacie_backend.module.vente.entity.Vente;

import java.util.UUID;

// Table "lignes_vente" — chaque médicament dans une vente
@Entity
@Table(name = "lignes_vente")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LigneVente {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Vente parente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vente_id")
    private Vente vente;

    // Médicament vendu
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medicament_id")
    private Medicament medicament;

    // Quantité vendue
    @Column(nullable = false)
    private Integer quantite;

    // Prix unitaire au moment de la vente
    @Column(nullable = false)
    private Double prixUnitaire;

    // Sous-total = quantite * prixUnitaire
    @Column(nullable = false)
    private Double sousTotal;
}