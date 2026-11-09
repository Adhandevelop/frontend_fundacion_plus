import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminCaseTableComponent } from '../shared/case-table/admin-case-table.component';
@Component({selector:'plus-admin-dashboard',standalone:true,imports:[RouterLink,AdminCaseTableComponent],templateUrl:'./admin-dashboard.component.html'})
export class AdminDashboardComponent {}
