import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { MedicamentService } from '../../../../core/services/medicament';


// Définition d'un item du menu
interface NavItem {
    label: string;       // Texte affiché
    icon: string;        // Icône PrimeIcons
    route: string;       // Route Angular
    badge?: number;      // Nombre d'alertes (optionnel)
    badgeColor?: string; // Couleur du badge
    separator?: boolean; // Séparateur visuel
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        RouterLinkActive,
        TooltipModule,
        BadgeModule
    ],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.scss'
})
export class SidebarComponent implements OnInit {

    // Reçoit l'état collapsed depuis le layout parent
    @Input() collapsed = false;

    // Nombre d'alertes stock critique (chargé depuis l'API)
    stockCritiqueCount = 0;

    // Structure du menu avec sections
    menuSections = [
        {
            label: 'PRINCIPAL',
            items: [
                {
                    label: 'Dashboard',
                    icon: 'pi-chart-bar',
                    route: '/dashboard'
                }
            ]
        },
        {
            label: 'GESTION',
            items: [
                {
                    label: 'Médicaments',
                    icon: 'pi-heart',
                    route: '/medicaments'
                },
                {
                    label: 'Patients',
                    icon: 'pi-users',
                    route: '/patients'
                },
                {
                    label: 'Ventes',
                    icon: 'pi-shopping-cart',
                    route: '/ventes'
                },
                {
                    label: 'Stock',
                    icon: 'pi-box',
                    route: '/stock',
                    // Badge dynamique chargé depuis API
                    get badge() { return 0; }
                }
            ]
        },
        {
            label: 'AI',
            items: [
                {
                    label: 'Assistant AI',
                    icon: 'pi-microchip-ai',
                    route: '/ai-assistant'
                }
            ]
        }
    ];

    constructor(private medicamentService: MedicamentService) {}

    ngOnInit(): void {
        // Charge le nombre de médicaments en stock critique
        // pour afficher le badge sur "Stock"
        this.medicamentService.getStockCritique().subscribe({
            next: (data) => {
                this.stockCritiqueCount = data.length;
                // Met à jour le badge de Stock
                const stockItem = this.menuSections[1].items
                    .find(i => i.route === '/stock');
                if (stockItem && data.length > 0) {
                    (stockItem as any).badge = data.length;
                }
            }
        });
    }
}
