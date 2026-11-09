import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/auth/auth.interceptor';
bootstrapApplication(AppComponent,{providers:[provideHttpClient(withInterceptors([authInterceptor])),provideRouter(routes,withInMemoryScrolling({anchorScrolling:'enabled'}))]}).catch(console.error);
