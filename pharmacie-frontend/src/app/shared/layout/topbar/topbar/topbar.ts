import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
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
import { AuthService } from '../../../../core/services/auth'; // ✅ AJOUTER

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
        CommonModule, RouterModule, ButtonModule,
        BadgeModule, TooltipModule, DrawerModule, TagModule
    ],
    templateUrl: './topbar.html',
    styleUrl: './topbar.scss'
})
export class TopbarComponent implements OnInit {

    @Output() onMenuToggle = new EventEmitter<void>();

    notifVisible = false;
    notifications: Notification[] = [];
    chiffreAffairesJour = 0;
    nombreVentesJour    = 0;
    medicamentsCritiques: Medicament[] = [];
    medicamentsExpirants: Medicament[] = [];

    // ✅ Menu profil
    profilMenuVisible = false;

    get unreadCount(): number {
        return this.notifications.filter(n => !n.read).length;
    }

    // ✅ Données utilisateur connecté (dynamique)
    get userName(): string {
        return this.authService.getUser()?.nomComplet || 'Utilisateur';
    }

    get userRole(): string {
        const role = this.authService.getUser()?.role;
        return role === 'ADMIN' ? 'Administrateur' : 'Pharmacien';
    }

    constructor(
        private medicamentService: MedicamentService,
        private venteService: VenteService,
        private authService: AuthService // ✅ AJOUTER
    ) {}

    ngOnInit(): void {
        this.chargerAlertes();
        this.chargerStatsJour();
    }

    private chargerAlertes(): void {
        this.medicamentService.getStockCritique().subscribe({
            next: (data) => {
                this.medicamentsCritiques = data;
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
        this.venteService.venteCreeeObservable.subscribe(() => {
        this.chargerStatsJour();
    });

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

    private chargerStatsJour(): void {
        this.venteService.getStatsJour().subscribe({
            next: (data) => {
                this.chiffreAffairesJour = data.chiffreAffaires || 0;
                this.nombreVentesJour    = data.nombreVentes || 0;
            }
        });
    }

    toggleMenu(): void {
        this.onMenuToggle.emit();
    }

    toggleNotifications(): void {
        this.notifVisible = !this.notifVisible;
    }

    // ✅ Toggle menu profil
    toggleProfilMenu(): void {
        this.profilMenuVisible = !this.profilMenuVisible;
    }

    // ✅ Déconnexion → redirige vers /login
    logout(): void {
        this.authService.logout();
    }

    marquerCommeLue(notif: Notification): void {
        notif.read = true;
    }

    marquerToutesLues(): void {
        this.notifications.forEach(n => n.read = true);
    }

    getSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' {
        const map: Record<string, any> = { danger: 'danger', warn: 'warn', info: 'info' };
        return map[type] || 'info';
    }

    getTimeAgo(date: Date): string {
        const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (diff < 60)   return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}min`;
        return `${Math.floor(diff / 3600)}h`;
    }

    // ✅ Dans la classe, ajouter cette méthode
@HostListener('document:click')
closeProfilMenu(): void {
    this.profilMenuVisible = false;
}
}
