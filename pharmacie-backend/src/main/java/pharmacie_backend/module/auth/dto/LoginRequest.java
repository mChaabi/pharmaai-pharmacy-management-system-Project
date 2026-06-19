package pharmacie_backend.module.auth.dto;

// Requête de connexion
public record LoginRequest(String email, String password) {}