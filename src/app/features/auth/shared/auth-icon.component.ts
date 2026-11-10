import { Component, Input } from '@angular/core';
const PATHS:Record<string,string>={
 mail:'M3 5h18v14H3z M3 5l9 7 9-7',
 lock:'M5 10h14v11H5z M8 10V7a4 4 0 0 1 8 0v3 M12 14v3',
 person:'M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8 M4 21v-2a8 8 0 0 1 16 0v2',
 info:'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18 M12 10v7 M12 7v.1',
 arrow_forward:'M4 12h16 M14 6l6 6-6 6',arrow_back:'M20 12H4 M10 6l-6 6 6 6',
 shield:'M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6z M8 12l3 3 5-6',
 format_quote:'M4 6h6v6H6c0 3 2 4 4 4v2c-4 0-6-3-6-6z M14 6h6v6h-4c0 3 2 4 4 4v2c-4 0-6-3-6-6z',
 gavel:'M6 3l6 6-3 3-6-6z M12 9l8 8 M3 20h12',
 hub:'M10 10h4v4h-4z M12 3v7 M3 20l7-6 M21 20l-7-6 M10 1h4v3h-4z M1 19h4v3H1z M19 19h4v3h-4z',
 how_to_reg:'M9 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8 M2 21v-3a7 7 0 0 1 12-5 M15 18l3 3 5-7',
 light_mode:'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',
 dark_mode:'M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z',
};
PATHS['lock_clock']=PATHS['lock_open']=PATHS['lock_reset']=PATHS['password']=PATHS['lock'];
PATHS['verified']=PATHS['verified_user']=PATHS['shield'];
@Component({selector:'plus-auth-icon',standalone:true,host:{'aria-hidden':'true',style:'display:inline-flex;flex-shrink:0;width:1em;height:1em'},template:`<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path [attr.d]="paths[name] || paths['info']"/></svg>`})
export class AuthIconComponent {@Input() name='info';readonly paths=PATHS;}
