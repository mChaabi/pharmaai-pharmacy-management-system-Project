import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { TagModule } from 'primeng/tag';
import { Medicament } from '../../../../core/models/medicament';
import { MedicamentService } from '../../../../core/services/medicament';
import { VenteService } from '../../../../core/services/vente';


// Structure d'une notification
interface Notification {
    id: number;
    message: string;
    type: 'danger' | 'warn' | 'info';
    icon: string;
    time: Date;
    read: boolean;
}

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ButtonModule,
        BadgeModule,
        TooltipModule,
        DrawerModule,
        TagModule
    ],
    templateUrl: './topbar.html',
    styleUrl: './topbar.scss'
})
export class TopbarComponent implements OnInit {

    // Émet un événement vers le Layout pour toggle la sidebar
    @Output() onMenuToggle = new EventEmitter<void>();

    // Panel notifications
    notifVisible = false;
    notifications: Notification[] = [];

    // Stats rapides pour le topbar
    chiffreAffairesJour = 0;
    nombreVentesJour    = 0;

    // Médicaments critiques pour les notifications
    medicamentsCritiques: Medicament[] = [];
    medicamentsExpirants: Medicament[] = [];

    // Nombre de notifications non lues
    get unreadCount(): number {
        return this.notifications.filter(n => !n.read).length;
    }

    constructor(
        private medicamentService: MedicamentService,
        private venteService: VenteService
    ) {}

    ngOnInit(): void {
        this.chargerAlertes();
        this.chargerStatsJour();
    }

    // Charge les alertes stock + expiration
    // et génère les notifications
    private chargerAlertes(): void {

        // Stock critique
        this.medicamentService.getStockCritique().subscribe({
            next: (data) => {
                this.medicamentsCritiques = data;
                // Crée une notification par médicament critique
                data.forEach((m, i) => {
                    this.notifications.push({
                        id: i + 1,
                        message: `Stock critique: ${m.nom} (${m.quantiteStock} unités)`,
                        type: 'danger',
                        icon: 'pi pi-exclamation-triangle',
                        time: new Date(),
                        read: false
                    });
                });
            }
        });

        // Médicaments expirants
        this.medicamentService.getExpirantBientot().subscribe({
            next: (data) => {
                this.medicamentsExpirants = data;
                data.forEach((m, i) => {
                    this.notifications.push({
                        id: 100 + i,
                        message: `Expiration proche: ${m.nom} (${m.dateExpiration})`,
                        type: 'warn',
                        icon: 'pi pi-calendar',
                        time: new Date(),
                        read: false
                    });
                });
            }
        });
    }

    // Charge le CA et nombre de ventes du jour
    private chargerStatsJour(): void {
        this.venteService.getStatsJour().subscribe({
            next: (data) => {
                this.chiffreAffairesJour = data.chiffreAffaires || 0;
                this.nombreVentesJour    = data.nombreVentes || 0;
            }
        });
    }

    // Toggle sidebar via EventEmitter vers Layout
    toggleMenu(): void {
        this.onMenuToggle.emit();
    }

    // Ouvre/ferme le panel notifications
    toggleNotifications(): void {
        this.notifVisible = !this.notifVisible;
    }

    // Marque une notification comme lue
    marquerCommeLue(notif: Notification): void {
        notif.read = true;
    }

    // Marque toutes comme lues
    marquerToutesLues(): void {
        this.notifications.forEach(n => n.read = true);
    }

    // Retourne la sévérité PrimeNG selon le type
    getSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' {
        const map: Record<string, any> = {
            danger: 'danger',
            warn:   'warn',
            info:   'info'
        };
        return map[type] || 'info';
    }

    // Formate le temps relatif (il y a X min)
    getTimeAgo(date: Date): string {
        const diff = Math.floor(
            (Date.now() - new Date(date).getTime()) / 1000);
        if (diff < 60)   return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}min`;
        return `${Math.floor(diff / 3600)}h`;
    }
}
