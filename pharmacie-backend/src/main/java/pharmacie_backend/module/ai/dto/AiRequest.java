package pharmacie_backend.module.ai.dto;

import jakarta.validation.constraints.NotBlank;

// Requête simple avec une question texte
public record AiRequest(
        @NotBlank(message = "La question ne peut pas être vide")
        String question
) {}