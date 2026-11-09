import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { CitizenAreaDemoService } from '../../features/citizen/services/citizen-area-demo.service';

@Component({selector: 'plus-citizen-layout', standalone: true, imports: [RouterLink, RouterLinkActive, RouterOutlet], templateUrl: './citizen-layout.component.html', styleUrl: './citizen-layout.component.css', encapsulation: ViewEncapsulation.None})
export class CitizenLayoutComponent {
  readonly area = inject(CitizenAreaDemoService);
  readonly theme = inject(ThemeService);
  readonly menu = signal(false);
}
