import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Select, SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DatePipe } from '@angular/common';

import { MedicamentService } from '../../core/services/medicament';
import { Medicament } from '../../core/models/medicament';

@Component({
    selector: 'app-medicaments',
    standalone: true,
    imports: [
        FormsModule, ReactiveFormsModule, RouterModule, DatePipe,
        TableModule, ButtonModule, DialogModule,Select,
        InputTextModule, InputNumberModule, SelectModule,
        DatePickerModule, TagModule, ToastModule, ConfirmDialogModule
    ], // CommonModule eliminado con éxito
    providers: [MessageService, ConfirmationService],
    templateUrl: './medicaments.html',
    styleUrl: './medicaments.scss'
})
export class MedicamentsComponent implements OnInit {

    // Servicios inyectados con la API inject()
    private medicamentService = inject(MedicamentService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    // Estado de la UI manejado con Signals
    medicaments = signal<Medicament[]>([]);
    isLoading = signal(true);
    dialogVisible = signal(false);
    isEditing = signal(false);
    selectedId = signal<string | null>(null);
    searchText = signal('');

    categories = [
        { label: 'Analgésique',    value: 'Analgésique' },
        { label: 'Antibiotique',   value: 'Antibiotique' },
        { label: 'Antidiabétique', value: 'Antidiabétique' },
        { label: 'Cardiovasculaire', value: 'Cardiovasculaire' },
        { label: 'Dermatologie',   value: 'Dermatologie' },
        { label: 'Vitamine',       value: 'Vitamine' },
        { label: 'Autre',          value: 'Autre' }
    ];

    form!: FormGroup;

    // Filtro optimizado utilizando computed() para recalcular solo cuando cambia el texto o la lista
    medicamentsFiltres = computed(() => {
        const list = this.medicaments();
        const search = this.searchText().toLowerCase().trim();

        if (!search) return list;

        return list.filter(m =>
            m.nom.toLowerCase().includes(search) ||
            m.categorie?.toLowerCase().includes(search)
        );
    });

    ngOnInit(): void {
        this.initForm();
        this.charger();
    }

    private initForm(): void {
        this.form = this.fb.group({
            nom:               ['', Validators.required],
            dci:               [''],
            forme:             [''],
            dosage:            [''],
            categorie:         ['', Validators.required],
            prixVente:         [0, [Validators.required, Validators.min(0)]],
            prixAchat:         [0],
            quantiteStock:     [0, [Validators.required, Validators.min(0)]],
            seuilAlerte:       [10],
            dateExpiration:    [null],
            codeBarres:        [''],
            ordonnanceRequise: [false],
            fabricant:         ['']
        });
    }

    charger(): void {
        this.isLoading.set(true);
        this.medicamentService.getAll().subscribe({
            next: (data) => {
                this.medicaments.set(data);
                this.isLoading.set(false);
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les médicaments'
                });
                this.isLoading.set(false);
            }
        });
    }

    ouvrirCreation(): void {
        this.isEditing.set(false);
        this.selectedId.set(null);
        this.form.reset({
            prixVente: 0,
            prixAchat: 0,
            quantiteStock: 0,
            seuilAlerte: 10,
            ordonnanceRequise: false
        });
        this.dialogVisible.set(true);
    }

    ouvrirModification(m: Medicament): void {
        this.isEditing.set(true);
        this.selectedId.set(m.id || null);
        this.form.patchValue({
            ...m,
            dateExpiration: m.dateExpiration ? new Date(m.dateExpiration) : null
        });
        this.dialogVisible.set(true);
    }

    sauvegarder(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const data: Medicament = this.form.getRawValue();
        const id = this.selectedId();

        if (this.isEditing() && id) {
            this.medicamentService.update(id, data).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: '✅ Modifié',
                        detail: 'Médicament modifié avec succès'
                    });
                    this.dialogVisible.set(false);
                    this.charger();
                }
            });
        } else {
            this.medicamentService.create(data).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: '✅ Créé',
                        detail: 'Médicament créé avec succès'
                    });
                    this.dialogVisible.set(false);
                    this.charger();
                }
            });
        }
    }

    confirmerSuppression(m: Medicament): void {
        this.confirmationService.confirm({
            message: `Supprimer "${m.nom}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-trash',
            accept: () => {
                this.medicamentService.delete(m.id!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: '✅ Supprimé',
                            detail: 'Médicament supprimé'
                        });
                        this.charger();
                    }
                });
            }
        });
    }

    getStockSeverity(m: Medicament): 'success' | 'warn' | 'danger' {
        if (!m.seuilAlerte) return 'success';
        if (m.quantiteStock <= m.seuilAlerte * 0.5) return 'danger';
        if (m.quantiteStock <= m.seuilAlerte)        return 'warn';
        return 'success';
    }
}
