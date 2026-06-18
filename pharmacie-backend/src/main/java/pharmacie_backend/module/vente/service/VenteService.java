package pharmacie_backend.module.vente.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pharmacie_backend.commons.exception.ResourceNotFoundException;
import pharmacie_backend.module.medicament.entity.Medicament;
import pharmacie_backend.module.medicament.repository.MedicamentRepository;
import pharmacie_backend.module.patient.entity.Patient;
import pharmacie_backend.module.patient.repository.PatientRepository;
import pharmacie_backend.module.vente.dto.LigneVenteDTO;
import pharmacie_backend.module.vente.dto.VenteDTO;
import pharmacie_backend.module.vente.entity.LigneVente;
import pharmacie_backend.module.vente.entity.Vente; // <--- L'IMPORT MANQUANT ÉTAIT ICI
import pharmacie_backend.module.vente.repository.VenteRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VenteService {

    private final VenteRepository venteRepository;
    private final MedicamentRepository medicamentRepository;
    private final PatientRepository patientRepository;

    // ─── Créer une vente ──────────────────────────────────
    @Transactional
    public VenteDTO creerVente(VenteDTO dto) {

        // 1. Construire les lignes de vente + décrémenter le stock
        List<LigneVente> lignes = new ArrayList<>();
        double montantTotal = 0.0;

        for (LigneVenteDTO ligneDto : dto.lignes()) {
            // Récupérer le médicament
            Medicament medicament = medicamentRepository
                    .findById(ligneDto.medicamentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Médicament non trouvé: " + ligneDto.medicamentId()));

            // Vérifier le stock disponible
            if (medicament.getQuantiteStock() < ligneDto.quantite()) {
                throw new IllegalStateException(
                        "Stock insuffisant pour: " + medicament.getNom() +
                                " (disponible: " + medicament.getQuantiteStock() + ")");
            }

            // Décrémenter le stock automatiquement
            medicament.setQuantiteStock(
                    medicament.getQuantiteStock() - ligneDto.quantite());
            medicamentRepository.save(medicament);

            // Calculer sous-total
            double sousTotal = medicament.getPrixVente() * ligneDto.quantite();
            montantTotal += sousTotal;

            // Créer la ligne
            LigneVente ligne = LigneVente.builder()
                    .medicament(medicament)
                    .quantite(ligneDto.quantite())
                    .prixUnitaire(medicament.getPrixVente())
                    .sousTotal(sousTotal)
                    .build();

            lignes.add(ligne);
        }

        // 2. Récupérer le patient si fourni
        Patient patient = null;
        if (dto.patientId() != null) {
            patient = patientRepository.findById(dto.patientId())
                    .orElse(null);
        }

        // 3. Créer la vente
        Vente vente = Vente.builder()
                .patient(patient)
                .dateVente(LocalDateTime.now())
                .montantTotal(montantTotal)
                .modePaiement(dto.modePaiement())
                .statut("VALIDEE")
                .numeroFacture(genererNumeroFacture())
                .refOrdonnance(dto.refOrdonnance())
                .pharmacien(dto.pharmacien())
                .build();

        // 4. Lier les lignes à la vente
        Vente venteSauvee = venteRepository.save(vente);
        lignes.forEach(l -> l.setVente(venteSauvee));
        venteSauvee.setLignes(lignes);

        return toDto(venteRepository.save(venteSauvee));
    }

    // ─── Lister toutes les ventes ─────────────────────────
    public List<VenteDTO> listerTous() {
        return venteRepository.findAll()
                .stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    // ─── Trouver par ID ───────────────────────────────────
    public VenteDTO trouverParId(UUID id) {
        return toDto(venteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vente non trouvée: " + id)));
    }

    // ─── Historique d'un patient ──────────────────────────
    public List<VenteDTO> historiquePatient(UUID patientId) {
        return venteRepository.findByPatientId(patientId)
                .stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    // ─── Annuler une vente ────────────────────────────────
    @Transactional
    public VenteDTO annulerVente(UUID id) {
        Vente vente = venteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vente non trouvée: " + id));

        // Restituer le stock pour chaque médicament
        vente.getLignes().forEach(ligne -> {
            Medicament med = ligne.getMedicament();
            med.setQuantiteStock(med.getQuantiteStock() + ligne.getQuantite());
            medicamentRepository.save(med);
        });

        vente.setStatut("ANNULEE");
        return toDto(venteRepository.save(vente));
    }

    // ─── Dashboard : stats du jour ────────────────────────
    public Map<String, Object> statsJour() {
        return Map.of(
                "chiffreAffaires", venteRepository.chiffreAffairesJour(),
                "nombreVentes",    venteRepository.nombreVentesJour(),
                "dernieresVentes", venteRepository
                        .findDernieresVentes(PageRequest.of(0, 5))
                        .stream().map(this::toDto).collect(Collectors.toList())
        );
    }

    // ─── Générer numéro de facture unique ─────────────────
    private String genererNumeroFacture() {
        String date = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "FAC-" + date + "-" + UUID.randomUUID()
                .toString().substring(0, 6).toUpperCase();
    }

    // ─── Convertisseurs ───────────────────────────────────
    private VenteDTO toDto(Vente v) {
        List<LigneVenteDTO> lignesDto = v.getLignes() == null
                ? List.of()
                : v.getLignes().stream().map(l -> new LigneVenteDTO(
                l.getId(),
                l.getMedicament().getId(),
                l.getMedicament().getNom(),
                l.getQuantite(),
                l.getPrixUnitaire(),
                l.getSousTotal()
        )).collect(Collectors.toList());

        return new VenteDTO(
                v.getId(),
                v.getPatient() != null ? v.getPatient().getId() : null,
                v.getPatient() != null
                        ? v.getPatient().getNom() + " " + v.getPatient().getPrenom()
                        : "Anonyme",
                v.getDateVente(),
                lignesDto,
                v.getMontantTotal(),
                v.getModePaiement(),
                v.getStatut(),
                v.getNumeroFacture(),
                v.getRefOrdonnance(),
                v.getPharmacien()
        );
    }
}