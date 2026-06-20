import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth-guard';

export const appRoutes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login')
            .then(m => m.LoginComponent)
    },
    {
        path: '',
        loadComponent: () => import('./shared/layout/layout/layout')
            .then(m => m.LayoutComponent),
        canActivate: [authGuard],
        children: [
            // ✅ Redirection par défaut → Ventes (pas Dashboard)
            { path: '', redirectTo: 'ventes', pathMatch: 'full' },

            // 🔒 ADMIN UNIQUEMENT
            {
                path: 'dashboard',
                canActivate: [roleGuard(['ADMIN'])],
                loadComponent: () => import('./features/dashboard/dashboard')
                    .then(m => m.DashboardComponent)
            },
            {
                path: 'stock',
                canActivate: [roleGuard(['ADMIN'])],
                loadComponent: () => import('./features/stock/stock/stock')
                    .then(m => m.StockComponent)
            },

            // ✅ ADMIN + PHARMACIEN
            {
                path: 'ventes',
                canActivate: [roleGuard(['ADMIN', 'PHARMACIEN'])],
                loadComponent: () => import('./features/ventes/ventes/ventes')
                    .then(m => m.VentesComponent)
            },
            {
                path: 'patients',
                canActivate: [roleGuard(['ADMIN', 'PHARMACIEN'])],
                loadComponent: () => import('./features/patients/patients/patients')
                    .then(m => m.PatientsComponent)
            },
            {
                path: 'medicaments',
                canActivate: [roleGuard(['ADMIN', 'PHARMACIEN'])],
                loadComponent: () => import('./features/medicaments/medicaments')
                    .then(m => m.MedicamentsComponent)
            },
            {
                path: 'ai-assistant',
                canActivate: [roleGuard(['ADMIN', 'PHARMACIEN'])],
                loadComponent: () => import('./features/ai-assistant/ai-assistant/ai-assistant')
                    .then(m => m.AiAssistantComponent)
            }
        ]
    }
];
