import { Component } from '@angular/core';
import { AdminCaseTableComponent } from '../shared/case-table/admin-case-table.component';
@Component({selector:'plus-admin-cases',standalone:true,imports:[AdminCaseTableComponent],templateUrl:'./admin-cases.component.html'})
export class AdminCasesComponent {}
