import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MouvementStock, StockDashboard } from '../../../core/models/stock';
import { Medicament } from '../../../core/models/medicament';
import { StockService } from '../../../core/services/stock';
import { MedicamentService } from '../../../core/services/medicament';


@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, DialogModule,
    SelectModule, InputNumberModule,
    InputTextModule, TagModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './stock.html',
  styleUrl: './stock.scss'
})
export class StockComponent implements OnInit {

  mouvements: MouvementStock[] = [];
  medicaments: Medicament[] = [];
  dashboard: StockDashboard | null = null;
  isLoading = false;
  dialogVisible = false;

  // Formulaire entrée stock
  selectedMedicamentId: string | null = null;
  quantite = 0;
  motif = '';
  refCommande = '';

  medicamentOptions: any[] = [];
   private destroy$ = new Subject<void>();


  constructor(
    private stockService: StockService,
    private medicamentService: MedicamentService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef // ✅ AJOUTER
  ) { }

   ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

  ngOnInit(): void {
    this.charger();
    this.chargerDashboard();
    this.chargerMedicaments();
  }

    charger(): void {
        this.isLoading = true;
        this.stockService.getTousLesMouvements()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.mouvements = data;
                    this.isLoading = false;
                    this.cdr.detectChanges(); // ✅
                },
                error: () => {
                    this.isLoading = false;
                    this.cdr.detectChanges();
                }
            });
    }

  chargerDashboard(): void {
        this.stockService.getDashboard()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.dashboard = data;
                    this.cdr.detectChanges(); // ✅
                }
            });
    }

   chargerMedicaments(): void {
        this.medicamentService.getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.medicaments = data;
                this.medicamentOptions = data.map(m => ({
                    label: `${m.nom} (stock actuel: ${m.quantiteStock})`,
                    value: m.id
                }));
                this.cdr.detectChanges(); // ✅
            });
    }
  ouvrirEntree(): void {
    this.selectedMedicamentId = null;
    this.quantite = 0;
    this.motif = '';
    this.refCommande = '';
    this.dialogVisible = true;
  }

  validerEntree(): void {
    if (!this.selectedMedicamentId || this.quantite <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Champs requis',
        detail: 'Sélectionnez un médicament et entrez une quantité'
      });
      return;
    }

    const payload = {
      medicamentId: this.selectedMedicamentId,
      quantite: this.quantite,
      motif: this.motif || 'Réapprovisionnement',
      refCommande: this.refCommande,
      utilisateur: 'Admin'
    };

    this.stockService.entreeStock(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: '✅ Stock mis à jour',
          detail: `+${this.quantite} unités ajoutées`
        });
        this.dialogVisible = false;
        this.charger();
        this.chargerDashboard();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de mettre à jour le stock'
        });
      }
    });
  }

  getTypeSeverity(type: string): 'success' | 'danger' | 'warn' | 'info' {
    const map: Record<string, 'success' | 'danger' | 'warn' | 'info'> = {
      ENTREE: 'success',
      SORTIE: 'danger',
      AJUSTEMENT: 'warn',
      PERTE: 'danger'
    };
    return map[type] || 'info';
  }
}
