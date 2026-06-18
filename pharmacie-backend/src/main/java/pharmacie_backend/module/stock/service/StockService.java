package pharmacie_backend.module.stock.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pharmacie_backend.commons.exception.ResourceNotFoundException;
import pharmacie_backend.module.medicament.entity.Medicament;
import pharmacie_backend.module.medicament.repository.MedicamentRepository;
import pharmacie_backend.module.stock.entity.MouvementStock;
import pharmacie_backend.module.stock.repository.StockRepository;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final MedicamentRepository medicamentRepository;

    // ─── Entrée de stock (réapprovisionnement) ────────────
    @Transactional
    public MouvementStock entreeStock(
            UUID medicamentId,
            Integer quantite,
            String motif,
            String refCommande,
            String utilisateur) {

        Medicament med = medicamentRepository.findById(medicamentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Médicament non trouvé: " + medicamentId));

        int stockAvant = med.getQuantiteStock();
        int stockApres = stockAvant + quantite;

        // Met à jour le stock du médicament
        med.setQuantiteStock(stockApres);
        medicamentRepository.save(med);

        // Enregistre le mouvement
        MouvementStock mouvement = MouvementStock.builder()
                .medicament(med)
                .type("ENTREE")
                .quantite(quantite)
                .stockAvant(stockAvant)
                .stockApres(stockApres)
                .dateMouvement(LocalDateTime.now())
                .motif(motif)
                .refCommande(refCommande)
                .utilisateur(utilisateur)
                .build();

        log.info("[STOCK] Entrée: {} +{} unités (stock: {}→{})",
                med.getNom(), quantite, stockAvant, stockApres);

        return stockRepository.save(mouvement);
    }

    // ─── Ajustement manuel du stock ───────────────────────
    @Transactional
    public MouvementStock ajusterStock(
            UUID medicamentId,
            Integer nouvelleQuantite,
            String motif,
            String utilisateur) {

        Medicament med = medicamentRepository.findById(medicamentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Médicament non trouvé: " + medicamentId));

        int stockAvant = med.getQuantiteStock();
        int difference = nouvelleQuantite - stockAvant;

        med.setQuantiteStock(nouvelleQuantite);
        medicamentRepository.save(med);

        MouvementStock mouvement = MouvementStock.builder()
                .medicament(med)
                .type("AJUSTEMENT")
                .quantite(Math.abs(difference))
                .stockAvant(stockAvant)
                .stockApres(nouvelleQuantite)
                .dateMouvement(LocalDateTime.now())
                .motif(motif)
                .utilisateur(utilisateur)
                .build();

        return stockRepository.save(mouvement);
    }

    // ─── Historique d'un médicament ───────────────────────
    public List<MouvementStock> historiqueMedicament(UUID medicamentId) {
        return stockRepository
                .findByMedicamentIdOrderByDateMouvementDesc(medicamentId);
    }

    // ─── Dashboard stock ──────────────────────────────────
    public Map<String, Object> dashboardStock() {
        long total = medicamentRepository.count();
        long critique = stockRepository.nombreMedicamentsCritiques();
        Double valeur = stockRepository.valeurTotaleStock();

        return Map.of(
                "totalMedicaments",   total,
                "stockCritique",      critique,
                "valeurTotaleStock",  valeur,
                "tauxDisponibilite",  total > 0
                        ? Math.round(((double)(total - critique) / total) * 100)
                        : 0
        );
    }

    // ─── Tous les mouvements ──────────────────────────────
    public List<MouvementStock> tousLesMouvements() {
        return stockRepository.findAll();
    }
}