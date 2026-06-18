package pharmacie_backend.module.ai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import pharmacie_backend.module.ai.dto.AiResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroqService {

    // WebClient configuré dans GroqConfig
    private final WebClient groqWebClient;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.model}")
    private String groqModel;

    // ─── SYSTEM PROMPT ─────────────────────────────────────
    // Définit le comportement de l'AI pour toutes les requêtes
    private static final String SYSTEM_PROMPT = """
        Tu es PharmAI, un assistant pharmacien expert hautement qualifié.
        
        Tes compétences :
        - Connaissance approfondie des médicaments et leurs compositions
        - Détection des interactions médicamenteuses dangereuses
        - Conseils sur les dosages et modes d'administration
        - Analyse d'ordonnances médicales
        - Conseils sur la conservation des médicaments
        
        Règles importantes :
        1. Réponds TOUJOURS en français
        2. Sois précis, clair et concis
        3. Signale toujours les risques graves en MAJUSCULES
        4. Termine chaque réponse par : "⚕️ Consultez toujours un médecin."
        5. Ne prescris jamais de traitement, oriente vers un médecin
        6. Si tu n'es pas sûr, dis-le clairement
        """;

    // ─── MÉTHODE PRINCIPALE ────────────────────────────────
    // Envoie un message à Groq et retourne la réponse
    private String appelGroq(String userMessage) {
        log.info("[GROQ] Envoi requête : {}", userMessage.substring(0, Math.min(50, userMessage.length())));

        // Corps de la requête JSON pour Groq
        Map<String, Object> requestBody = Map.of(
                "model", groqModel,
                "messages", List.of(
                        // Message système : définit le rôle de l'AI
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        // Message utilisateur : la vraie question
                        Map.of("role", "user", "content", userMessage)
                ),
                "max_tokens", 800,       // Longueur max de la réponse
                "temperature", 0.3,      // 0 = précis, 1 = créatif (0.3 pour médical)
                "top_p", 0.9,            // Diversité des réponses
                "stream", false          // Pas de streaming pour l'instant
        );

        try {
            // Appel HTTP POST vers Groq
            Map<?, ?> response = groqWebClient.post()
                    .uri(this.groqApiUrl)
                    .header("Authorization", "Bearer " + groqApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class) // <-- Cambia String.class por Map.class
                    .block(); // Bloquant (synchrone)

            // Extraction du texte depuis la réponse JSON
            // Structure Groq : response.choices[0].message.content
            List<?> choices = (List<?>) response.get("choices");
            Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
            Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
            String content = (String) message.get("content");

            log.info("[GROQ] ✅ Réponse reçue ({} caractères)", content.length());
            return content;

        } catch (WebClientResponseException e) {
            // Erreur HTTP de l'API Groq (401, 429, 500, etc.)
            log.error("[GROQ] ❌ Erreur HTTP {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return switch (e.getStatusCode().value()) {
                case 401 -> "❌ Clé API Groq invalide. Vérifiez votre configuration.";
                case 429 -> "⏳ Limite de requêtes atteinte. Réessayez dans quelques secondes.";
                case 503 -> "🔧 Service Groq temporairement indisponible.";
                default  -> "❌ Erreur AI (code " + e.getStatusCode().value() + ").";
            };
        } catch (Exception e) {
            log.error("[GROQ] ❌ Erreur inattendue: ", e);
            return "❌ Service AI temporairement indisponible. Veuillez réessayer.";
        }
    }

    // ─── 1. QUESTION LIBRE ─────────────────────────────────
    // Le pharmacien pose n'importe quelle question
    public AiResponse poserQuestion(String question) {
        long debut = System.currentTimeMillis();

        // Enrichit la question avec du contexte pharmacie
        String promptEnrichi = """
            Question du pharmacien : %s
            
            Réponds de manière professionnelle et cite les médicaments
            concernés si applicable.
            """.formatted(question);

        String reponse = appelGroq(promptEnrichi);
        long duree = System.currentTimeMillis() - debut;

        return new AiResponse(reponse, "question", LocalDateTime.now(), duree);
    }

    // ─── 2. INTERACTIONS MÉDICAMENTEUSES ───────────────────
    // Vérifie si des médicaments peuvent être pris ensemble
    public AiResponse verifierInteractions(List<String> medicaments) {
        long debut = System.currentTimeMillis();

        String prompt = """
            Analyse les interactions médicamenteuses entre ces médicaments :
            %s
            
            Pour chaque interaction, indique :
            1. NIVEAU DE RISQUE : Faible / Modéré / Élevé / CRITIQUE
            2. DESCRIPTION : Ce qui peut se passer
            3. CONDUITE À TENIR : Que faire ?
            
            Si aucune interaction dangereuse, rassure le pharmacien.
            """.formatted(String.join("\n- ", medicaments));

        String reponse = appelGroq(prompt);
        long duree = System.currentTimeMillis() - debut;

        return new AiResponse(reponse, "interaction", LocalDateTime.now(), duree);
    }

    // ─── 3. ANALYSER UNE ORDONNANCE ────────────────────────
    // Extrait les médicaments et instructions d'une ordonnance
    public AiResponse analyserOrdonnance(String texteOrdonnance, String langue) {
        long debut = System.currentTimeMillis();

        String prompt = """
            Analyse cette ordonnance médicale et retourne un JSON structuré :
            
            ORDONNANCE :
            %s
            
            Retourne UNIQUEMENT ce JSON (sans texte avant ou après) :
            {
              "medicaments": [
                {
                  "nom": "nom du médicament",
                  "dosage": "ex: 500mg",
                  "quantite": "ex: 2 boites",
                  "posologie": "ex: 1 comprimé matin et soir",
                  "duree": "ex: 7 jours"
                }
              ],
              "patient": "nom si mentionné ou null",
              "medecin": "nom si mentionné ou null",
              "date": "date si mentionnée ou null",
              "instructions_speciales": ["instruction1", "instruction2"],
              "alertes": ["alerte importante si détectée"]
            }
            """.formatted(texteOrdonnance);

        String reponse = appelGroq(prompt);
        long duree = System.currentTimeMillis() - debut;

        return new AiResponse(reponse, "ordonnance", LocalDateTime.now(), duree);
    }

    // ─── 4. CONSEILS POSOLOGIE ─────────────────────────────
    // Conseils sur la bonne façon de prendre un médicament
    public AiResponse conseilsPosologie(String medicament, String contexte) {
        long debut = System.currentTimeMillis();

        String prompt = """
            Donne des conseils de posologie pour : %s
            Contexte patient : %s
            
            Inclus :
            - Mode d'administration recommandé
            - Moments de prise optimaux (avec/sans repas, etc.)
            - Durée habituelle du traitement
            - Ce qu'il faut éviter (alcool, conduite, etc.)
            - Effets secondaires courants à surveiller
            """.formatted(medicament, contexte);

        String reponse = appelGroq(prompt);
        long duree = System.currentTimeMillis() - debut;

        return new AiResponse(reponse, "posologie", LocalDateTime.now(), duree);
    }

    // ─── 5. SUGGESTION ALTERNATIVE ─────────────────────────
    // Propose des alternatives si un médicament est en rupture
    public AiResponse suggererAlternative(String medicamentIndisponible) {
        long debut = System.currentTimeMillis();

        String prompt = """
            Le médicament "%s" est en rupture de stock.
            
            Propose des alternatives thérapeutiques :
            1. Médicaments génériques équivalents
            2. Médicaments de la même classe thérapeutique
            3. Précautions lors du changement de médicament
            4. Quand consulter le médecin avant de changer
            """.formatted(medicamentIndisponible);

        String reponse = appelGroq(prompt);
        long duree = System.currentTimeMillis() - debut;

        return new AiResponse(reponse, "alternative", LocalDateTime.now(), duree);
    }

    // ─── 6. RÉSUMÉ PATIENT ─────────────────────────────────
    // Génère un résumé de l'historique médicamenteux d'un patient
    public AiResponse resumePatient(String historiquePatient) {
        long debut = System.currentTimeMillis();

        String prompt = """
            Analyse cet historique médicamenteux d'un patient et génère :
            
            HISTORIQUE :
            %s
            
            1. RÉSUMÉ des traitements en cours
            2. INTERACTIONS potentielles entre ses médicaments actuels
            3. ALERTES importantes à signaler au pharmacien
            4. RECOMMANDATIONS pour le suivi
            """.formatted(historiquePatient);

        String reponse = appelGroq(prompt);
        long duree = System.currentTimeMillis() - debut;

        return new AiResponse(reponse, "resume_patient", LocalDateTime.now(), duree);
    }
}