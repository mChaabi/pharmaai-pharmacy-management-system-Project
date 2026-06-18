package pharmacie_backend.module.patient.dto;

import java.time.LocalDate;
import java.util.UUID;

public record PatientDTO(
        UUID id,
        String nom,
        String prenom,
        LocalDate dateNaissance,
        String telephone,
        String email,
        String adresse,
        String sexe,
        String cin,
        String numeroAssurance,
        String allergies,
        String maladiesChroniques,
        String medecinTraitant,
        LocalDate dateInscription
) {}