import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({selector: 'plus-citizen-layout', standalone: true, imports: [RouterLink, RouterLinkActive, RouterOutlet], templateUrl: './citizen-layout.component.html', styleUrl: './citizen-layout.component.css', encapsulation: ViewEncapsulation.None})
export class CitizenLayoutComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly menu = signal(false);
}
