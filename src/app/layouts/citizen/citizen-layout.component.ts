import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { CitizenInboxCountersService } from '../../features/citizen/services/citizen-inbox-counters.service';
import { ResponsiveNavigationDirective } from '../../shared/navigation/responsive-navigation.directive';

@Component({selector: 'plus-citizen-layout', standalone: true, imports: [RouterLink, RouterLinkActive, RouterOutlet, ResponsiveNavigationDirective], templateUrl: './citizen-layout.component.html', styleUrl: './citizen-layout.component.css', encapsulation: ViewEncapsulation.None})
export class CitizenLayoutComponent {
  readonly auth = inject(AuthService);
  readonly counters = inject(CitizenInboxCountersService);
  readonly theme = inject(ThemeService);
  readonly menu = signal(false);
  constructor(){this.counters.refresh();}
}
