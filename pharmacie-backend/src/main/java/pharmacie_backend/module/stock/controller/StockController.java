package pharmacie_backend.module.stock.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import pharmacie_backend.module.stock.entity.MouvementStock;
import pharmacie_backend.module.stock.service.StockService;

import java.util.*;

@RestController
@RequestMapping("/api/v1/stock")
@Tag(name = "Stock", description = "Gestion du stock et mouvements")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    // POST /api/v1/stock/entree → Réapprovisionner
    @PostMapping("/entree")
    @Operation(summary = "Entrée de stock")
    public ResponseEntity<MouvementStock> entreeStock(
            @RequestBody Map<String, Object> request) {

        UUID medicamentId = UUID.fromString(
                (String) request.get("medicamentId"));
        Integer quantite   = (Integer) request.get("quantite");
        String motif       = (String) request.get("motif");
        String refCommande = (String) request.get("refCommande");
        String utilisateur = (String) request.get("utilisateur");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(stockService.entreeStock(
                        medicamentId, quantite, motif, refCommande, utilisateur));
    }

    // PUT /api/v1/stock/ajuster → Ajustement manuel
    @PutMapping("/ajuster")
    @Operation(summary = "Ajuster le stock manuellement")
    public ResponseEntity<MouvementStock> ajusterStock(
            @RequestBody Map<String, Object> request) {

        UUID medicamentId    = UUID.fromString(
                (String) request.get("medicamentId"));
        Integer nouvelleQte  = (Integer) request.get("nouvelleQuantite");
        String motif         = (String) request.get("motif");
        String utilisateur   = (String) request.get("utilisateur");

        return ResponseEntity.ok(stockService.ajusterStock(
                medicamentId, nouvelleQte, motif, utilisateur));
    }

    // GET /api/v1/stock/historique/{medicamentId}
    @GetMapping("/historique/{medicamentId}")
    @Operation(summary = "Historique des mouvements d'un médicament")
    public ResponseEntity<List<MouvementStock>> historique(
            @PathVariable UUID medicamentId) {
        return ResponseEntity.ok(
                stockService.historiqueMedicament(medicamentId));
    }

    // GET /api/v1/stock/dashboard
    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard stock")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(stockService.dashboardStock());
    }

    // GET /api/v1/stock/mouvements
    @GetMapping("/mouvements")
    @Operation(summary = "Tous les mouvements de stock")
    public ResponseEntity<List<MouvementStock>> tousLesMouvements() {
        return ResponseEntity.ok(stockService.tousLesMouvements());
    }
}