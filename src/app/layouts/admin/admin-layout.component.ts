import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({selector: 'plus-admin-layout', standalone: true, imports: [RouterLink, RouterLinkActive, RouterOutlet], templateUrl: './admin-layout.component.html', styleUrl: './admin-layout.component.css', encapsulation: ViewEncapsulation.None})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly menu = signal(false);
}
