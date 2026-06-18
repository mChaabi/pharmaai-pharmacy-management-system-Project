package pharmacie_backend.module.medicament.service;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import pharmacie_backend.commons.exception.ResourceNotFoundException;
import pharmacie_backend.module.medicament.dto.MedicamentDTO;
import pharmacie_backend.module.medicament.entity.Medicament;
import pharmacie_backend.module.medicament.repository.MedicamentRepository;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicamentService {

    private final MedicamentRepository medicamentRepository;

    // ─── Créer un médicament ──────────────────────────────
    public MedicamentDTO creerMedicament(MedicamentDTO dto) {
        // Convertit DTO → Entité → Sauvegarde → Reconvertit en DTO
        Medicament medicament = toEntity(dto);
        return toDto(medicamentRepository.save(medicament));
    }

    // ─── Lister tous les médicaments ─────────────────────
    public List<MedicamentDTO> listerTous() {
        return medicamentRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ─── Chercher par ID ──────────────────────────────────
    public MedicamentDTO trouverParId(UUID id) {
        return toDto(medicamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médicament non trouvé: " + id)));
    }

    // ─── Modifier un médicament ───────────────────────────
    public MedicamentDTO modifierMedicament(UUID id, MedicamentDTO dto) {
        Medicament existing = medicamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médicament non trouvé: " + id));

        // Met à jour les champs
        existing.setNom(dto.nom());
        existing.setPrixVente(dto.prixVente());
        existing.setQuantiteStock(dto.quantiteStock());
        existing.setDateExpiration(dto.dateExpiration());

        return toDto(medicamentRepository.save(existing));
    }

    // ─── Supprimer un médicament ──────────────────────────
    public void supprimerMedicament(UUID id) {
        if (!medicamentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Médicament non trouvé: " + id);
        }
        medicamentRepository.deleteById(id);
    }

    // ─── Médicaments en stock critique ────────────────────
    public List<MedicamentDTO> stockCritique() {
        return medicamentRepository.findMedicamentsStockCritique()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // ─── Médicaments qui expirent bientôt (30 jours) ─────
    public List<MedicamentDTO> expirantBientot() {
        LocalDate dans30Jours = LocalDate.now().plusDays(30);
        return medicamentRepository.findMedicamentsExpirantAvant(dans30Jours)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // ─── Convertisseurs ───────────────────────────────────
    private MedicamentDTO toDto(Medicament m) {
        return new MedicamentDTO(
                m.getId(), m.getNom(), m.getDci(), m.getForme(),
                m.getDosage(), m.getCategorie(), m.getPrixVente(),
                m.getPrixAchat(), m.getQuantiteStock(), m.getSeuilAlerte(),
                m.getDateExpiration(), m.getCodeBarres(),
                m.getOrdonnanceRequise(), m.getFabricant()
        );
    }

    private Medicament toEntity(MedicamentDTO dto) {
        return Medicament.builder()
                .nom(dto.nom()).dci(dto.dci()).forme(dto.forme())
                .dosage(dto.dosage()).categorie(dto.categorie())
                .prixVente(dto.prixVente()).prixAchat(dto.prixAchat())
                .quantiteStock(dto.quantiteStock()).seuilAlerte(dto.seuilAlerte())
                .dateExpiration(dto.dateExpiration()).codeBarres(dto.codeBarres())
                .ordonnanceRequise(dto.ordonnanceRequise()).fabricant(dto.fabricant())
                .build();
    }

    public Map<String, Object> getStatsMedicaments() {
        Map<String, Object> stats = new HashMap<>();

        long totalReferences = medicamentRepository.count();
        Long totalStockPhysique = medicamentRepository.sumTotalStock();
        long produitsEnAlerte = medicamentRepository.countMedicamentsEnAlerte();

        stats.put("totalReferences", totalReferences); // Ex: 5 types de médicaments différents
        stats.put("totalStockPhysique", totalStockPhysique); // Ex: 550 boîtes au total en magasin
        stats.put("produitsEnAlerte", produitsEnAlerte); // Ex: 1 produit bientôt en rupture

        return stats;
    }
}