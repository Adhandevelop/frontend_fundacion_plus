import { Component, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CaseSubmissionDemoService } from '../../services/case-submission-demo.service';
import { CaseDraftService } from '../../services/case-draft.service';

@Component({selector: 'plus-case-confirmation', standalone: true, imports: [DatePipe, DecimalPipe, RouterLink], templateUrl: './case-confirmation.component.html'})
export class CaseConfirmationComponent {
  readonly submission = inject(CaseSubmissionDemoService);
  private readonly drafts = inject(CaseDraftService);
  private readonly router = inject(Router);
  newForm() {this.submission.clear(); this.drafts.clear(); void this.router.navigate(['/ciudadano/casos/nuevo']);}
}
