import { Component, Input } from '@angular/core';

const PATHS:Record<string,string>={
  description:'M5 3h10l4 4v14H5z M15 3v5h4 M8 12h8 M8 16h8',
  dashboard:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  folder_shared:'M3 6h7l2 2h9v12H3z M3 6V4h7l2 2 M9 13h6 M9 16h6',
  map:'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2z M9 3v16 M15 5v16',
  bar_chart:'M4 20V11h4v9 M10 20V4h4v16 M16 20V8h4v12',
  history:'M4 5v5h5 M4 10a8 8 0 1 1 1 7 M12 7v5l3 2',
  manage_accounts:'M8 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8 M2 21v-3a6 6 0 0 1 12 0v3 M16 10a3 3 0 0 1 0 6 M17 18a5 5 0 0 1 5 3',
  location_city:'M3 21V9h7v12 M10 21V3h8v18 M18 12h3v9 M6 12v1 M6 16v1 M13 6h2 M13 10h2 M13 14h2 M13 18h2',
  newspaper:'M3 4h18v16H3z M6 7h6v5H6z M15 7h3 M15 10h3 M6 15h12 M6 17h12',
  volunteer_activism:'M3 13h5l4 3h5a2 2 0 0 1 0 4h-7l-7-3 M2 12v9 M12 5c-3-5-7 0 0 4 7-4 3-9 0-4',
  inbox:'M3 4h18v16H3z M3 13h5l2 3h4l2-3h5',
  forum:'M3 3h15v12H8l-5 4z M18 7h3v15l-5-4h-5v-3',
};

@Component({selector:'plus-navigation-icon',standalone:true,host:{'aria-hidden':'true',style:'display:inline-flex;flex-shrink:0;width:24px;height:24px'},template:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path [attr.d]="paths[name] || paths['dashboard']"/></svg>`})
export class NavigationIconComponent { @Input() name='dashboard';readonly paths=PATHS; }
