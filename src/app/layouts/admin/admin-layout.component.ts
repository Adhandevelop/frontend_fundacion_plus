import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

@Component({selector: 'plus-admin-layout', standalone: true, imports: [RouterLink, RouterLinkActive, RouterOutlet], templateUrl: './admin-layout.component.html', styleUrl: './admin-layout.component.css', encapsulation: ViewEncapsulation.None})
export class AdminLayoutComponent {
  readonly theme = inject(ThemeService);
  readonly menu = signal(false);
}
