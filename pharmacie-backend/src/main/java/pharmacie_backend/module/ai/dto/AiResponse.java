package pharmacie_backend.module.ai.dto;

import java.time.LocalDateTime;

// Réponse enrichie avec métadonnées
public record AiResponse(
        String reponse,           // Réponse de Groq
        String type,              // "question", "interaction", "ordonnance"
        LocalDateTime timestamp,  // Heure de la réponse
        long dureeMs              // Durée de l'appel en millisecondes
) {}