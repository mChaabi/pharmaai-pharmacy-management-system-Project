package pharmacie_backend.module.patient.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pharmacie_backend.commons.exception.ResourceNotFoundException;
import pharmacie_backend.module.patient.dto.PatientDTO;
import pharmacie_backend.module.patient.entity.Patient;
import pharmacie_backend.module.patient.repository.PatientRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    // ─── Créer un patient ─────────────────────────────────
    public PatientDTO creer(PatientDTO dto) {
        Patient patient = toEntity(dto);
        // Date d'inscription automatique
        patient.setDateInscription(LocalDate.now());
        return toDto(patientRepository.save(patient));
    }

    // ─── Lister tous ──────────────────────────────────────
    public List<PatientDTO> listerTous() {
        return patientRepository.findAll()
                .stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    // ─── Trouver par ID ───────────────────────────────────
    public PatientDTO trouverParId(UUID id) {
        return toDto(patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient non trouvé: " + id)));
    }

    // ─── Modifier ─────────────────────────────────────────
    public PatientDTO modifier(UUID id, PatientDTO dto) {
        Patient existing = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient non trouvé: " + id));

        existing.setNom(dto.nom());
        existing.setPrenom(dto.prenom());
        existing.setTelephone(dto.telephone());
        existing.setEmail(dto.email());
        existing.setAdresse(dto.adresse());
        existing.setAllergies(dto.allergies());
        existing.setMaladiesChroniques(dto.maladiesChroniques());

        return toDto(patientRepository.save(existing));
    }

    // ─── Supprimer ────────────────────────────────────────
    public void supprimer(UUID id) {
        if (!patientRepository.existsById(id))
            throw new ResourceNotFoundException("Patient non trouvé: " + id);
        patientRepository.deleteById(id);
    }

    // ─── Rechercher par nom ───────────────────────────────
    public List<PatientDTO> rechercher(String search) {
        return patientRepository.rechercherParNom(search)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ─── Convertisseurs ───────────────────────────────────
    private PatientDTO toDto(Patient p) {
        return new PatientDTO(
                p.getId(), p.getNom(), p.getPrenom(),
                p.getDateNaissance(), p.getTelephone(),
                p.getEmail(), p.getAdresse(), p.getSexe(),
                p.getCin(), p.getNumeroAssurance(),
                p.getAllergies(), p.getMaladiesChroniques(),
                p.getMedecinTraitant(), p.getDateInscription()
        );
    }

    private Patient toEntity(PatientDTO dto) {
        return Patient.builder()
                .nom(dto.nom()).prenom(dto.prenom())
                .dateNaissance(dto.dateNaissance())
                .telephone(dto.telephone()).email(dto.email())
                .adresse(dto.adresse()).sexe(dto.sexe())
                .cin(dto.cin()).numeroAssurance(dto.numeroAssurance())
                .allergies(dto.allergies())
                .maladiesChroniques(dto.maladiesChroniques())
                .medecinTraitant(dto.medecinTraitant())
                .build();
    }
}