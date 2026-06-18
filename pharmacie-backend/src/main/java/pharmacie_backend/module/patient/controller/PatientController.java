package pharmacie_backend.module.patient.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import pharmacie_backend.module.patient.dto.PatientDTO;
import pharmacie_backend.module.patient.service.PatientService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patients")
@Tag(name = "Patients", description = "Gestion des patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @Operation(summary = "Créer un patient")
    public ResponseEntity<PatientDTO> creer(
            @Valid @RequestBody PatientDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(patientService.creer(dto));
    }

    @GetMapping
    @Operation(summary = "Lister tous les patients")
    public ResponseEntity<List<PatientDTO>> listerTous() {
        return ResponseEntity.ok(patientService.listerTous());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver un patient par ID")
    public ResponseEntity<PatientDTO> trouverParId(
            @PathVariable UUID id) {
        return ResponseEntity.ok(patientService.trouverParId(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un patient")
    public ResponseEntity<PatientDTO> modifier(
            @PathVariable UUID id,
            @Valid @RequestBody PatientDTO dto) {
        return ResponseEntity.ok(patientService.modifier(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un patient")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        patientService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recherche")
    @Operation(summary = "Rechercher un patient par nom")
    public ResponseEntity<List<PatientDTO>> rechercher(
            @RequestParam String q) {
        return ResponseEntity.ok(patientService.rechercher(q));
    }
}