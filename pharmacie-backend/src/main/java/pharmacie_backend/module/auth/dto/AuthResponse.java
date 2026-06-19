package pharmacie_backend.module.auth.dto;

// Réponse après connexion réussie
public record AuthResponse(
        String token,
        String email,
        String nomComplet,
        String role
) {}