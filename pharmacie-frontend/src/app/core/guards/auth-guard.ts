// core/guards/auth-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

// ✅ Guard de connexion (inchangé)
export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) return true;

    router.navigate(['/login']);
    return false;
};

// ✅ Guard de rôle — ajouté dans le MÊME fichier
// core/guards/auth-guard.ts
export function roleGuard(rolesAutorises: string[]): CanActivateFn {
    return () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        const role = authService.getUser()?.role;

        if (role && rolesAutorises.includes(role)) {
            return true;
        }

        // ✅ Redirige vers Ventes (accessible à tous)
        router.navigate(['/ventes']);
        return false;
    };
}
