package pharmacie_backend.module.medicament.controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pharmacie_backend.module.medicament.dto.MedicamentDTO;
import pharmacie_backend.module.medicament.service.MedicamentService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/medicaments")
@Tag(name = "Médicaments", description = "Gestion des médicaments")
@RequiredArgsConstructor
public class MedicamentController {

    private final MedicamentService medicamentService;

    // POST /api/v1/medicaments → Créer
    @PostMapping
    @Operation(summary = "Créer un médicament")
    public ResponseEntity<MedicamentDTO> creer(@RequestBody MedicamentDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medicamentService.creerMedicament(dto));
    }

    // GET /api/v1/medicaments → Lister tous
    @GetMapping
    @Operation(summary = "Lister tous les médicaments")
    public ResponseEntity<List<MedicamentDTO>> listerTous() {
        return ResponseEntity.ok(medicamentService.listerTous());
    }

    // GET /api/v1/medicaments/{id} → Chercher par ID
    @GetMapping("/{id}")
    @Operation(summary = "Trouver un médicament par ID")
    public ResponseEntity<MedicamentDTO> trouverParId(@PathVariable UUID id) {
        return ResponseEntity.ok(medicamentService.trouverParId(id));
    }

    @GetMapping("/stats/count")
    @Operation(summary = "Obtenir les statistiques et le compte des médicaments en stock")
    public ResponseEntity<Map<String, Object>> getMedicamentsCount() {
        return ResponseEntity.ok(medicamentService.getStatsMedicaments());
    }
    // PUT /api/v1/medicaments/{id} → Modifier
    @PutMapping("/{id}")
    @Operation(summary = "Modifier un médicament")
    public ResponseEntity<MedicamentDTO> modifier(
            @PathVariable UUID id,
            @RequestBody MedicamentDTO dto) {
        return ResponseEntity.ok(medicamentService.modifierMedicament(id, dto));
    }

    // DELETE /api/v1/medicaments/{id} → Supprimer
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un médicament")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        medicamentService.supprimerMedicament(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/v1/medicaments/alertes/stock-critique
    @GetMapping("/alertes/stock-critique")
    @Operation(summary = "Médicaments en stock critique")
    public ResponseEntity<List<MedicamentDTO>> stockCritique() {
        return ResponseEntity.ok(medicamentService.stockCritique());
    }

    // GET /api/v1/medicaments/alertes/expiration
    @GetMapping("/alertes/expiration")
    @Operation(summary = "Médicaments expirant bientôt")
    public ResponseEntity<List<MedicamentDTO>> expirantBientot() {
        return ResponseEntity.ok(medicamentService.expirantBientot());
    }
}