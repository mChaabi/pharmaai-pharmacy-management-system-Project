import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { forkJoin } from 'rxjs';

import { MedicamentService } from '../../core/services/medicament';
import { VenteService } from '../../core/services/vente';
import { StockService } from '../../core/services/stock';
import { Medicament } from '../../core/models/medicament';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterModule,
    ChartModule, TagModule,
    ButtonModule, SkeletonModule
  ], // CommonModule eliminado gracias al nuevo flujo de control nativo
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {

  // Inyección de servicios moderna
  private medicamentService = inject(MedicamentService);
  private venteService = inject(VenteService);
  private stockService = inject(StockService);

  // Estados reactivos con Signals
  isLoading = signal(true);

  // ─── KPIs ─────────────────────────────────────────────
  totalMedicaments = signal(0);
  stockCritique = signal(0);
  chiffreAffaires = signal(0);
  valeurStock = signal(0);
  nombreVentesJour = signal(0);
  tauxDisponibilite = signal(0);

  // ─── Listes ───────────────────────────────────────────
  medicamentsCritiques = signal<Medicament[]>([]);
  medicamentsExpirants = signal<Medicament[]>([]);
  dernieresVentes = signal<any[]>([]);

  // ─── Charts ───────────────────────────────────────────
  donutData = signal<any>(null);
  donutOptions = signal<any>(null);

  ngOnInit(): void {
    forkJoin({
      medicaments: this.medicamentService.getAll(),
      critique: this.medicamentService.getStockCritique(),
      expirants: this.medicamentService.getExpirantBientot(),
      statsVentes: this.venteService.getStatsJour(),
      stockDash: this.stockService.getDashboard()
    }).subscribe({
      // dashboard.component.ts — modifier le subscribe next
      next: ({ medicaments, critique, expirants, statsVentes, stockDash }) => {
        this.totalMedicaments.set(medicaments.length);
        this.stockCritique.set(critique.length);
        this.medicamentsCritiques.set(critique.slice(0, 5));
        this.medicamentsExpirants.set(expirants.slice(0, 5));

        // ✅ Protéger contre les valeurs null/undefined
        this.chiffreAffaires.set(statsVentes?.chiffreAffaires ?? 0);
        this.nombreVentesJour.set(statsVentes?.nombreVentes ?? 0);
        this.dernieresVentes.set(statsVentes?.dernieresVentes ?? []);
        this.valeurStock.set(stockDash?.valeurTotaleStock ?? 0);
        this.tauxDisponibilite.set(stockDash?.tauxDisponibilite ?? 0);

        this.buildDonut(medicaments);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Dashboard error:', err);
        this.isLoading.set(false);
      }
    });
  }

  // ─── Donut : répartition par catégorie ────────────────
  private buildDonut(medicaments: Medicament[]): void {
    const categories: Record<string, number> = {};
    medicaments.forEach(m => {
      const cat = m.categorie || 'Autre';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    this.donutData.set({
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: [
          '#3b82f6', '#22c55e', '#f59e0b',
          '#ef4444', '#8b5cf6', '#06b6d4'
        ],
        borderWidth: 0
      }]
    });

    this.donutOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 14, font: { size: 12 } }
        }
      }
    });
  }

  // ─── Helpers ──────────────────────────────────────────
  getStockSeverity(m: Medicament): string {
    if (!m.seuilAlerte) return 'info';
    const ratio = m.quantiteStock / m.seuilAlerte;
    if (ratio <= 0.5) return 'danger';
    if (ratio <= 1) return 'warn';
    return 'success';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatMontant(n: number): string {
    return n?.toFixed(2) + ' MAD';
  }
}
