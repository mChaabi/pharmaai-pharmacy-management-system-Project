import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder,
         FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Patient } from '../../../core/models/patient';
import { PatientService } from '../../../core/services/patient';

@Component({
    selector: 'app-patients',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule,
        TableModule, ButtonModule, DialogModule,
        InputTextModule, SelectModule, DatePickerModule,
        TagModule, ToastModule, ConfirmDialogModule, TextareaModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './patients.html',
    styleUrl: './patients.scss'
})
export class PatientsComponent implements OnInit, OnDestroy {

    patients: Patient[] = [];
    isLoading = false; // ✅ false par défaut
    dialogVisible = false;
    isEditing = false;
    selectedId: string | null = null;
    searchText = '';

    sexeOptions = [
        { label: 'Masculin', value: 'M' },
        { label: 'Féminin',  value: 'F' }
    ];

    form!: FormGroup;
    private destroy$ = new Subject<void>();

    get patientsFiltres(): Patient[] {
        if (!this.searchText) return this.patients;
        const s = this.searchText.toLowerCase();
        return this.patients.filter(p =>
            p.nom.toLowerCase().includes(s) ||
            p.prenom.toLowerCase().includes(s) ||
            p.telephone?.toLowerCase().includes(s)
        );
    }

    constructor(
        private patientService: PatientService,
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef // ✅ CRUCIAL
    ) {}

    ngOnInit(): void {
        this.initForm();
        this.charger();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initForm(): void {
        this.form = this.fb.group({
            nom:               ['', Validators.required],
            prenom:            ['', Validators.required],
            dateNaissance:     [null],
            telephone:         ['', Validators.required],
            email:             ['', Validators.email],
            adresse:           [''],
            sexe:              [''],
            cin:               [''],
            numeroAssurance:   [''],
            allergies:         [''],
            maladiesChroniques:[''],
            medecinTraitant:   ['']
        });
    }

    charger(): void {
        this.isLoading = true;

        this.patientService.getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.patients  = data;
                    this.isLoading = false;
                    // ✅ Force Angular à détecter les changements
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Erreur:', err);
                    this.isLoading = false;
                    this.cdr.detectChanges();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de charger les patients'
                    });
                }
            });
    }

    ouvrirCreation(): void {
        this.isEditing = false;
        this.selectedId = null;
        this.form.reset();
        this.dialogVisible = true;
    }

    ouvrirModification(p: Patient): void {
        this.isEditing = true;
        this.selectedId = p.id!;
        this.form.patchValue({
            ...p,
            dateNaissance: p.dateNaissance
                ? new Date(p.dateNaissance) : null
        });
        this.dialogVisible = true;
    }

    sauvegarder(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const data: Patient = this.form.getRawValue();
        const action = this.isEditing
            ? this.patientService.update(this.selectedId!, data)
            : this.patientService.create(data);

        action.pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: '✅ Succès',
                    detail: this.isEditing ? 'Patient modifié' : 'Patient créé'
                });
                this.dialogVisible = false;
                this.charger();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: err?.error?.message || 'Erreur survenue'
                });
            }
        });
    }

    confirmerSuppression(p: Patient): void {
        this.confirmationService.confirm({
            message: `Supprimer ${p.nom} ${p.prenom} ?`,
            header: 'Confirmation',
            icon: 'pi pi-trash',
            accept: () => {
                this.patientService.delete(p.id!)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: '✅ Supprimé',
                                detail: 'Patient supprimé'
                            });
                            this.charger();
                        }
                    });
            }
        });
    }

    getAge(dateNaissance: string): number {
        const diff = Date.now() - new Date(dateNaissance).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    }
}
