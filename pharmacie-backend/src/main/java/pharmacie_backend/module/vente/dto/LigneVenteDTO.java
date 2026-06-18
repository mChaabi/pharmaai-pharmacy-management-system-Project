package pharmacie_backend.module.vente.dto;

import java.util.UUID;

public record LigneVenteDTO(
        UUID id,
        UUID medicamentId,
        String medicamentNom,    // Nom du médicament
        Integer quantite,
        Double prixUnitaire,
        Double sousTotal
) {}