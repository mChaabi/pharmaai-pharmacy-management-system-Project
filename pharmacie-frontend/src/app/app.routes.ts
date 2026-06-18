import { Routes } from '@angular/router';

export const appRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./shared/layout/layout/layout')
            .then(m => m.LayoutComponent),
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard')
                    .then(m => m.DashboardComponent)
            },
            {
                path: 'medicaments',
                loadComponent: () => import('./features/medicaments/medicaments')
                    .then(m => m.MedicamentsComponent)
            },
            {
                path: 'patients',
                loadComponent: () => import('./features/patients/patients/patients')
                    .then(m => m.PatientsComponent)
            },
            {
                path: 'ventes',
                loadComponent: () => import('./features/ventes/ventes/ventes')
                    .then(m => m.VentesComponent)
            },
            {
                path: 'stock',
                loadComponent: () => import('./features/stock/stock/stock')
                    .then(m => m.StockComponent)
            },
            {
                path: 'ai-assistant',
                loadComponent: () => import('./features/ai-assistant/ai-assistant/ai-assistant')
                    .then(m => m.AiAssistantComponent)
            }
        ]
    }
];
