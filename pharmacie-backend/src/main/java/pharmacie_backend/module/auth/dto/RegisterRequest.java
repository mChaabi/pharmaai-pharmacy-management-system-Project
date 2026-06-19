// RegisterRequest.java
package pharmacie_backend.module.auth.dto;

public record RegisterRequest(
        String email, String password,
        String nomComplet, String role
) {}