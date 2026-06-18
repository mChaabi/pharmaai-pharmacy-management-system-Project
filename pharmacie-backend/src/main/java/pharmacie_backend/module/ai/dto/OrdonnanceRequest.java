package pharmacie_backend.module.ai.dto;

import jakarta.validation.constraints.NotBlank;

// Texte de l'ordonnance à analyser
public record OrdonnanceRequest(
        @NotBlank(message = "Le texte de l'ordonnance est requis")
        String texte,

        // Optionnel : langue de l'ordonnance
        String langue
) {}