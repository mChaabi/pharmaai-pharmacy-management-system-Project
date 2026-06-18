package pharmacie_backend.module.ai.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pharmacie_backend.module.ai.dto.AiRequest;
import pharmacie_backend.module.ai.dto.AiResponse;
import pharmacie_backend.module.ai.dto.InteractionRequest;
import pharmacie_backend.module.ai.dto.OrdonnanceRequest;
import pharmacie_backend.module.ai.service.GroqService;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/ai")
@Tag(name = "AI Pharmacien", description = "Assistant pharmacien propulsé par Groq AI")
@RequiredArgsConstructor
public class AiController {

    private final GroqService groqService;

    // ─── POST /api/v1/ai/question ──────────────────────────
    // Question libre au pharmacien AI
    @PostMapping("/question")
    @Operation(summary = "Poser une question libre au pharmacien AI")
    public ResponseEntity<AiResponse> poserQuestion(
            @Valid @RequestBody AiRequest request) {

        log.info("[AI] Question reçue : {}", request.question());
        AiResponse reponse = groqService.poserQuestion(request.question());
        return ResponseEntity.ok(reponse);
    }

    // ─── POST /api/v1/ai/interactions ──────────────────────
    // Vérifier les interactions entre médicaments
    @PostMapping("/interactions")
    @Operation(summary = "Vérifier les interactions médicamenteuses")
    public ResponseEntity<AiResponse> verifierInteractions(
            @Valid @RequestBody InteractionRequest request) {

        log.info("[AI] Vérification interactions : {}", request.medicaments());
        AiResponse reponse = groqService.verifierInteractions(request.medicaments());
        return ResponseEntity.ok(reponse);
    }

    // ─── POST /api/v1/ai/ordonnance ────────────────────────
    // Analyser une ordonnance médicale
    @PostMapping("/ordonnance")
    @Operation(summary = "Analyser une ordonnance avec l'AI")
    public ResponseEntity<AiResponse> analyserOrdonnance(
            @Valid @RequestBody OrdonnanceRequest request) {

        log.info("[AI] Analyse ordonnance reçue");
        String langue = request.langue() != null ? request.langue() : "fr";
        AiResponse reponse = groqService.analyserOrdonnance(request.texte(), langue);
        return ResponseEntity.ok(reponse);
    }

    // ─── POST /api/v1/ai/posologie ─────────────────────────
    // Conseils de posologie pour un médicament
    @PostMapping("/posologie")
    @Operation(summary = "Obtenir des conseils de posologie")
    public ResponseEntity<AiResponse> conseilsPosologie(
            @RequestBody Map<String, String> request) {

        String medicament = request.get("medicament");
        String contexte   = request.getOrDefault("contexte", "adulte sans pathologie particulière");

        log.info("[AI] Conseils posologie : {}", medicament);
        AiResponse reponse = groqService.conseilsPosologie(medicament, contexte);
        return ResponseEntity.ok(reponse);
    }

    // ─── POST /api/v1/ai/alternative ───────────────────────
    // Suggérer une alternative à un médicament indisponible
    @PostMapping("/alternative")
    @Operation(summary = "Suggérer une alternative thérapeutique")
    public ResponseEntity<AiResponse> suggererAlternative(
            @RequestBody Map<String, String> request) {

        String medicament = request.get("medicament");
        log.info("[AI] Alternative pour : {}", medicament);
        AiResponse reponse = groqService.suggererAlternative(medicament);
        return ResponseEntity.ok(reponse);
    }

    // ─── POST /api/v1/ai/patient/resume ────────────────────
    // Résumé de l'historique d'un patient
    @PostMapping("/patient/resume")
    @Operation(summary = "Analyser l'historique médicamenteux d'un patient")
    public ResponseEntity<AiResponse> resumePatient(
            @RequestBody Map<String, String> request) {

        String historique = request.get("historique");
        log.info("[AI] Résumé patient demandé");
        AiResponse reponse = groqService.resumePatient(historique);
        return ResponseEntity.ok(reponse);
    }

    // ─── GET /api/v1/ai/health ─────────────────────────────
    // Vérifier si le service AI est opérationnel
    @GetMapping("/health")
    @Operation(summary = "Vérifier l'état du service AI")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "service", "Groq AI",
                "message", "Service AI opérationnel"
        ));
    }
}