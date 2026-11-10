import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CaseSubmissionService } from '../../services/case-submission.service';
import { CaseDraftService } from '../../services/case-draft.service';

@Component({selector: 'plus-case-confirmation', standalone: true, imports: [DatePipe, RouterLink], templateUrl: './case-confirmation.component.html'})
export class CaseConfirmationComponent {
  readonly submission = inject(CaseSubmissionService);
  private readonly drafts = inject(CaseDraftService);
  private readonly router = inject(Router);
  newForm() {this.submission.clear(); this.drafts.clear(); void this.router.navigate(['/ciudadano/casos/nuevo']);}
}
