import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CitizenCaseTableComponent } from '../components/case-table/case-table.component';
@Component({selector:'plus-citizen-cases',standalone:true,imports:[RouterLink,CitizenCaseTableComponent],templateUrl:'./citizen-cases.component.html'})
export class CitizenCasesComponent {}
