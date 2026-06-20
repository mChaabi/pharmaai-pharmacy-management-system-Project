import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { MedicamentService } from '../../../../core/services/medicament';
import { AuthService } from '../../../../core/services/auth';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  badgeColor?: string;
  separator?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, RouterModule, RouterLinkActive,
    TooltipModule, BadgeModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent implements OnInit {

  @Input() collapsed = false;

  stockCritiqueCount = 0;

  // ✅ Sera rempli dynamiquement selon le rôle
  menuSections: NavSection[] = [];

  constructor(
    private medicamentService: MedicamentService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // ✅ Construit le menu selon le rôle au démarrage
    this.buildMenu();

    // Charge le badge stock critique (seulement si Admin verra Stock)
    this.medicamentService.getStockCritique().subscribe({
      next: (data) => {
        this.stockCritiqueCount = data.length;
        const stockSection = this.menuSections.find(s => s.label === 'GESTION');
        const stockItem = stockSection?.items.find(i => i.route === '/stock');
        if (stockItem && data.length > 0) {
          stockItem.badge = data.length;
        }
      }
    });
  }

  get isAdmin(): boolean {
    return this.authService.getUser()?.role === 'ADMIN';
  }

  // ✅ Construit dynamiquement le menu selon ADMIN ou PHARMACIEN
  private buildMenu(): void {

    if (this.isAdmin) {
      // 🔓 ADMIN → menu complet
      this.menuSections = [
        {
          label: 'PRINCIPAL',
          items: [
            { label: 'Dashboard', icon: 'pi-chart-bar', route: '/dashboard' }
          ]
        },
        {
          label: 'GESTION',
          items: [
            { label: 'Médicaments', icon: 'pi-heart', route: '/medicaments' },
            { label: 'Patients', icon: 'pi-users', route: '/patients' },
            { label: 'Ventes', icon: 'pi-shopping-cart', route: '/ventes' },
            { label: 'Stock', icon: 'pi-box', route: '/stock', badge: 0 }
          ]
        },
        {
          label: 'AI',
          items: [
            { label: 'Assistant AI', icon: 'pi-microchip-ai', route: '/ai-assistant' }
          ]
        }
      ];

    } else {
      // 🔒 PHARMACIEN → menu limité (pas Dashboard, pas Stock)
      this.menuSections = [
        {
          label: 'GESTION',
          items: [
            { label: 'Ventes', icon: 'pi-shopping-cart', route: '/ventes' },
            { label: 'Patients', icon: 'pi-users', route: '/patients' },
            { label: 'Médicaments', icon: 'pi-heart', route: '/medicaments' }
          ]
        },
        {
          label: 'AI',
          items: [
            { label: 'Assistant AI', icon: 'pi-microchip-ai', route: '/ai-assistant' }
          ]
        }
      ];
    }
  }
}
