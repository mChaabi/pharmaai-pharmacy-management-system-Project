package pharmacie_backend.module.auth.dto;

import java.util.UUID;

public record UserDTO(
        UUID id,
        String email,
        String nomComplet,
        String role,
        boolean actif
) {}