package pharmacie_backend.module.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import pharmacie_backend.module.auth.dto.*;
import pharmacie_backend.module.auth.entity.*;
import pharmacie_backend.module.auth.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ─── Connexion ─────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        // Vérifie le mot de passe hashé
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        if (!user.isActif()) {
            throw new RuntimeException("Compte désactivé");
        }

        // Génère le token JWT
        String token = jwtService.generateToken(
                user.getEmail(), user.getRole().name());

        return new AuthResponse(
                token, user.getEmail(),
                user.getNomComplet(), user.getRole().name()
        );
    }

    // ─── Créer un utilisateur (Admin seulement) ────────────
    public void creerUtilisateur(String email, String password,
                                 String nomComplet, Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Cet email existe déjà");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password)) // Hash le mdp
                .nomComplet(nomComplet)
                .role(role)
                .actif(true)
                .build();

        userRepository.save(user);
    }
}