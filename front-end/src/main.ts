import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/components/app/app.component';
import { routes } from './app/app.routes';  // Assuming you have a routes.ts file for your route definitions

// Bootstrap the Angular application
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()),
    provideRouter(routes),  // Provide the router configuration for routing functionality
  ]
}).catch(err => console.error(err));
