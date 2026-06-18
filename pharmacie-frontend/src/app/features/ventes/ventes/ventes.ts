import { Component, OnInit , OnDestroy, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LigneVente, Vente } from '../../../core/models/vente';
import { Medicament } from '../../../core/models/medicament';
import { Patient } from '../../../core/models/patient';
import { VenteService } from '../../../core/services/vente';
import { PatientService } from '../../../core/services/patient';
import { MedicamentService } from '../../../core/services/medicament';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-ventes',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        TableModule, ButtonModule, DialogModule,
        SelectModule, InputNumberModule,
        TagModule, ToastModule, ConfirmDialogModule, DividerModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './ventes.html',
    styleUrl: './ventes.scss'
})
export class VentesComponent implements OnInit {

    ventes: Vente[]         = [];
    medicaments: Medicament[]= [];
    patients: Patient[]      = [];
    isLoading                = true;
    dialogVisible            = false;

    // ─── Formulaire vente (caisse) ────────────────────────
    selectedPatientId: string | null = null;
    selectedMedicamentId: string | null = null;
    selectedQuantite = 1;
    modePaiement = 'ESPECES';
    pharmacien = 'Pharmacien';

    // Panier de la vente courante
    panier: LigneVente[] = [];

    // Options pour les selects
    patientOptions:    any[] = [];
    medicamentOptions: any[] = [];
    modePaiementOptions = [
        { label: 'Espèces',   value: 'ESPECES' },
        { label: 'Carte',     value: 'CARTE' },
        { label: 'Assurance', value: 'ASSURANCE' }
    ];

    // Montant total calculé depuis le panier
    get montantTotal(): number {
        return this.panier.reduce((sum, l) => sum + (l.sousTotal || 0), 0);
    }

     private destroy$ = new Subject<void>();

    constructor(
        private venteService: VenteService,
        private medicamentService: MedicamentService,
        private patientService: PatientService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef // ✅ AJOUTER
    ) {}

        // 3. Ajouter ngOnDestroy
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


    ngOnInit(): void {
        this.charger();
        this.chargerOptions();
    }

    charger(): void {
        this.isLoading = true;
        this.venteService.getAll().subscribe({
            next: (data) => {
                this.ventes = data;
                this.isLoading = false;
            },
            error: () => { this.isLoading = false; }
        });
    }

    // Charge les options médicaments + patients
    chargerOptions(): void {
        this.medicamentService.getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.medicaments = data;
                this.medicamentOptions = data.map(m => ({
                    label: `${m.nom} — ${m.prixVente} MAD (stock: ${m.quantiteStock})`,
                    value: m.id
                }));
                this.cdr.detectChanges(); // ✅
            });

        this.patientService.getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.patients = data;
                this.patientOptions = [
                    { label: 'Anonyme', value: null },
                    ...data.map(p => ({
                        label: `${p.nom} ${p.prenom}`,
                        value: p.id
                    }))
                ];
                this.cdr.detectChanges(); // ✅
            });
    }


    ouvrirCaisse(): void {
        this.panier = [];
        this.selectedPatientId = null;
        this.selectedMedicamentId = null;
        this.selectedQuantite = 1;
        this.modePaiement = 'ESPECES';
        this.dialogVisible = true;
    }

    // Ajoute un médicament au panier
    ajouterAuPanier(): void {
        if (!this.selectedMedicamentId) return;

        const med = this.medicaments.find(
            m => m.id === this.selectedMedicamentId);
        if (!med) return;

        // Vérifie si déjà dans le panier
        const existing = this.panier.find(
            l => l.medicamentId === this.selectedMedicamentId);

        if (existing) {
            // Augmente la quantité
            existing.quantite += this.selectedQuantite;
            existing.sousTotal = existing.quantite * (med.prixVente || 0);
        } else {
            // Ajoute une nouvelle ligne
            this.panier.push({
                medicamentId:  med.id!,
                medicamentNom: med.nom,
                quantite:      this.selectedQuantite,
                prixUnitaire:  med.prixVente,
                sousTotal:     med.prixVente * this.selectedQuantite
            });
        }

        // Reset sélection médicament
        this.selectedMedicamentId = null;
        this.selectedQuantite = 1;
    }

    // Supprime une ligne du panier
    supprimerLigne(index: number): void {
        this.panier.splice(index, 1);
    }

    // Valide et envoie la vente au backend
    validerVente(): void {
        if (this.panier.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Panier vide',
                detail: 'Ajoutez au moins un médicament'
            });
            return;
        }

        const vente: Vente = {
            patientId:    this.selectedPatientId || undefined,
            lignes:       this.panier,
            modePaiement: this.modePaiement,
            pharmacien:   this.pharmacien
        };

        this.venteService.create(vente).subscribe({
            next: (result) => {
                this.messageService.add({
                    severity: 'success',
                    summary: '✅ Vente validée !',
                    detail: `Facture: ${result.numeroFacture} — ${result.montantTotal?.toFixed(2)} MAD`
                });
                this.dialogVisible = false;
                this.charger();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: err?.error?.message || 'Erreur lors de la vente'
                });
            }
        });
    }

    // Annule une vente
    annulerVente(v: Vente): void {
        this.confirmationService.confirm({
            message: `Annuler la vente ${v.numeroFacture} ?`,
            header: 'Confirmation',
            accept: () => {
                this.venteService.annuler(v.id!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Vente annulée',
                            detail: 'Stock restitué automatiquement'
                        });
                        this.charger();
                    }
                });
            }
        });
    }

    getStatutSeverity(s: string): 'success' | 'danger' {
    return s === 'VALIDEE' ? 'success' : 'danger';
}
}
