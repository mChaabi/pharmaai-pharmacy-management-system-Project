package pharmacie_backend.module.ai.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

// Liste de médicaments à vérifier
public record InteractionRequest(
        @NotEmpty(message = "La liste de médicaments est requise")
        List<String> medicaments
) {}