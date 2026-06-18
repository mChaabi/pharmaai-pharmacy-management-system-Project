package pharmacie_backend.module.stock.entity;

import jakarta.persistence.*;
import lombok.*;
import pharmacie_backend.module.medicament.entity.Medicament;

import java.time.LocalDateTime;
import java.util.UUID;

// Chaque mouvement de stock est tracé ici
@Entity
@Table(name = "mouvements_stock")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MouvementStock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Médicament concerné
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medicament_id", nullable = false)
    private Medicament medicament;

    // Type : ENTREE / SORTIE / AJUSTEMENT / PERTE
    @Column(nullable = false)
    private String type;

    // Quantité du mouvement (toujours positif)
    @Column(nullable = false)
    private Integer quantite;

    // Stock avant ce mouvement
    private Integer stockAvant;

    // Stock après ce mouvement
    private Integer stockApres;

    // Date du mouvement
    @Column(nullable = false)
    private LocalDateTime dateMouvement;

    // Motif : "Commande fournisseur", "Vente", "Périmé", etc.
    private String motif;

    // Référence bon de commande si applicable
    private String refCommande;

    // Utilisateur qui a fait le mouvement
    private String utilisateur;
}