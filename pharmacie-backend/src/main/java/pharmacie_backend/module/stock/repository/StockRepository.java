package pharmacie_backend.module.stock.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pharmacie_backend.module.stock.entity.MouvementStock;

import java.util.List;
import java.util.UUID;

public interface StockRepository extends JpaRepository<MouvementStock, UUID> {

    // Tous les mouvements d'un médicament
    List<MouvementStock> findByMedicamentIdOrderByDateMouvementDesc(
            UUID medicamentId);

    // Mouvements par type (ENTREE, SORTIE, etc.)
    List<MouvementStock> findByTypeOrderByDateMouvementDesc(String type);

    // Valeur totale du stock
    @Query("""
        SELECT COALESCE(SUM(m.quantiteStock * m.prixAchat), 0)
        FROM Medicament m
    """)
    Double valeurTotaleStock();

    // Nombre total de médicaments en stock critique
    @Query("""
        SELECT COUNT(m) FROM Medicament m
        WHERE m.quantiteStock <= m.seuilAlerte
    """)
    Long nombreMedicamentsCritiques();
}