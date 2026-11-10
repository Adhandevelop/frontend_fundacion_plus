import { AuthIconComponent } from '../../features/auth/shared/auth-icon.component';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'plus-auth-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, AuthIconComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AuthLayoutComponent {
  readonly theme = inject(ThemeService);
}
