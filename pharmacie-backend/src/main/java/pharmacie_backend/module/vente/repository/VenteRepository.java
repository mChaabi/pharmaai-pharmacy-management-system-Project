package pharmacie_backend.module.vente.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pharmacie_backend.module.vente.entity.Vente;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface VenteRepository extends JpaRepository<Vente, UUID> {

    // Ventes d'un patient spécifique
    List<Vente> findByPatientId(UUID patientId);

    // Ventes entre deux dates
    @Query("""
        SELECT v FROM Vente v
        WHERE v.dateVente BETWEEN :debut AND :fin
        ORDER BY v.dateVente DESC
    """)
    List<Vente> findVentesEntreDates(
            @Param("debut") LocalDateTime debut,
            @Param("fin") LocalDateTime fin
    );

    // Chiffre d'affaires du jour
    // ✅ APRÈS — nom correct de l'entité Java
    @Query("""
    SELECT COALESCE(SUM(v.montantTotal), 0)
    FROM Vente v
    WHERE CAST(v.dateVente AS date) = CURRENT_DATE
    AND v.statut = 'VALIDEE'
""")
    Double chiffreAffairesJour();

    // Nombre de ventes aujourd'hui
    @Query("""
    SELECT COUNT(v) FROM Vente v
    WHERE CAST(v.dateVente AS date) = CURRENT_DATE
""")
    Long nombreVentesJour();

    // Dernières ventes (pour le dashboard)
    @Query("""
    SELECT v FROM Vente v
    ORDER BY v.dateVente DESC
""")
    List<Vente> findDernieresVentes(Pageable pageable);
}