import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar/sidebar';
import { TopbarComponent } from '../topbar/topbar/topbar';


// Composant principal qui englobe toute l'application
// Structure : Sidebar à gauche + Topbar en haut + Contenu à droite
@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,       // Affiche la page active
        SidebarComponent,   // Menu latéral
        TopbarComponent     // Barre du haut
    ],
    templateUrl: './layout.html',
    styleUrl: './layout.scss'
})
export class LayoutComponent {
    // Contrôle si la sidebar est réduite ou étendue
    sidebarCollapsed = false;

    // Toggle appelé depuis le topbar
    toggleSidebar(): void {
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }
}
