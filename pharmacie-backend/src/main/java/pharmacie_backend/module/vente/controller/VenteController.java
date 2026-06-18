package pharmacie_backend.module.vente.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import pharmacie_backend.module.vente.dto.VenteDTO;
import pharmacie_backend.module.vente.service.VenteService;

import java.util.*;

@RestController
@RequestMapping("/api/v1/ventes")
@Tag(name = "Ventes", description = "Gestion des ventes et caisse")
@RequiredArgsConstructor
public class VenteController {

    private final VenteService venteService;

    @PostMapping
    @Operation(summary = "Créer une vente")
    public ResponseEntity<VenteDTO> creer(@Valid @RequestBody VenteDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(venteService.creerVente(dto));
    }

    @GetMapping
    @Operation(summary = "Lister toutes les ventes")
    public ResponseEntity<List<VenteDTO>> listerTous() {
        return ResponseEntity.ok(venteService.listerTous());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver une vente par ID")
    public ResponseEntity<VenteDTO> trouverParId(
            @PathVariable UUID id) {
        return ResponseEntity.ok(venteService.trouverParId(id));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Historique des ventes d'un patient")
    public ResponseEntity<List<VenteDTO>> historiquePatient(
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(venteService.historiquePatient(patientId));
    }

    @PutMapping("/{id}/annuler")
    @Operation(summary = "Annuler une vente")
    public ResponseEntity<VenteDTO> annuler(@PathVariable UUID id) {
        return ResponseEntity.ok(venteService.annulerVente(id));
    }

    @GetMapping("/stats/jour")
    @Operation(summary = "Statistiques du jour")
    public ResponseEntity<Map<String, Object>> statsJour() {
        return ResponseEntity.ok(venteService.statsJour());
    }
}