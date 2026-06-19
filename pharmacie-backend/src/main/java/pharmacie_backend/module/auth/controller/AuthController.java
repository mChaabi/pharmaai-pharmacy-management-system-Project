package pharmacie_backend.module.auth.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pharmacie_backend.module.auth.dto.*;
import pharmacie_backend.module.auth.entity.Role;
import pharmacie_backend.module.auth.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentification")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // Réservé Admin (sécurisé plus tard avec @PreAuthorize)
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        authService.creerUtilisateur(
                request.email(), request.password(),
                request.nomComplet(), Role.valueOf(request.role())
        );
        return ResponseEntity.ok("Utilisateur créé");
    }
}