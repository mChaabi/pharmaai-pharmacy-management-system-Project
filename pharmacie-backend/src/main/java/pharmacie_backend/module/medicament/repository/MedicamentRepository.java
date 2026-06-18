package pharmacie_backend.module.medicament.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pharmacie_backend.module.medicament.entity.Medicament;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

// Repository : toutes les requêtes SQL vers la table medicaments
public interface MedicamentRepository extends JpaRepository<Medicament, UUID> {

    // Chercher par nom (recherche partielle insensible à la casse)
    List<Medicament> findByNomContainingIgnoreCase(String nom);

    // Chercher par catégorie
    List<Medicament> findByCategorie(String categorie);

    // Médicaments avec stock critique (stock < seuilAlerte)
    @Query("SELECT m FROM Medicament m WHERE m.quantiteStock <= m.seuilAlerte")
    List<Medicament> findMedicamentsStockCritique();

    // Médicaments qui expirent avant une date donnée
    @Query("SELECT m FROM Medicament m WHERE m.dateExpiration <= :date")
    List<Medicament> findMedicamentsExpirantAvant(@Param("date") LocalDate date);

    // Chercher par code-barres
    Medicament findByCodeBarres(String codeBarres);


    // Compte le nombre total de références de médicaments
    long count();

    // Optionnel : Compte la somme de toutes les quantités en stock de la pharmacie
    @Query("SELECT COALESCE(SUM(m.quantiteStock), 0) FROM Medicament m")
    Long sumTotalStock();

    // Optionnel : Compte le nombre de médicaments en alerte de stock
    @Query("SELECT COUNT(m) FROM Medicament m WHERE m.quantiteStock <= m.seuilAlerte")
    long countMedicamentsEnAlerte();
}