package pharmacie_backend.module.vente.dto;

import pharmacie_backend.module.vente.entity.LigneVente;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record VenteDTO(
        UUID id,
        UUID patientId,
        String patientNom,       // Nom complet du patient
        LocalDateTime dateVente,
        List<LigneVenteDTO> lignes,
        Double montantTotal,
        String modePaiement,
        String statut,
        String numeroFacture,
        String refOrdonnance,
        String pharmacien
) {}