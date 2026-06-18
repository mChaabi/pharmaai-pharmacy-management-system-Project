package pharmacie_backend.module.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pharmacie_backend.module.patient.entity.Patient;

import java.util.List;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {

    // Recherche par nom ou prénom
    @Query("""
        SELECT p FROM Patient p
        WHERE LOWER(p.nom) LIKE LOWER(CONCAT('%',:search,'%'))
        OR LOWER(p.prenom) LIKE LOWER(CONCAT('%',:search,'%'))
    """)
    List<Patient> rechercherParNom(@Param("search") String search);

    // Chercher par téléphone
    Patient findByTelephone(String telephone);

    // Chercher par CIN
    Patient findByCin(String cin);

    // Patients avec allergies à un médicament spécifique
    @Query("""
        SELECT p FROM Patient p
        WHERE LOWER(p.allergies) LIKE LOWER(CONCAT('%',:allergie,'%'))
    """)
    List<Patient> findByAllergie(@Param("allergie") String allergie);
}