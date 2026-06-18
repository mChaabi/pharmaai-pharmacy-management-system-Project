package pharmacie_backend.module.medicament.dto;
import java.time.LocalDate;
import java.util.UUID;

// DTO = Data Transfer Object
// Ce qu'on envoie/reçoit via l'API (pas l'entité directement)
public record MedicamentDTO(
        UUID id,
        String nom,
        String dci,
        String forme,
        String dosage,
        String categorie,
        Double prixVente,
        Double prixAchat,
        Integer quantiteStock,
        Integer seuilAlerte,
        LocalDate dateExpiration,
        String codeBarres,
        Boolean ordonnanceRequise,
        String fabricant
) {}