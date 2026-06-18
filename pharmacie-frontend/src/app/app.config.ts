import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes,
       withComponentInputBinding() // ✅ Active le binding
    ),
     provideClientHydration(withEventReplay()),
     // Active HttpClient pour les appels API
        provideHttpClient(withFetch()),
        providePrimeNG({
        theme: { preset: Aura }
    })
  ]
};
