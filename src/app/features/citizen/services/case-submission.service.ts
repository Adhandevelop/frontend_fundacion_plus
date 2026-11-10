import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, concatMap, from, map, of, switchMap, tap, toArray } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { CitizenCasesApiService } from './citizen-cases-api.service';
import { CitizenCase, CreateCaseRequest } from './citizen-cases.models';
import { CaseDraftService } from './case-draft.service';

export interface CaseReceipt {
  owner:string; caso:CitizenCase; attachments:{name:string;uploaded:boolean;error:string}[];
}
@Injectable({providedIn:'root'})
export class CaseSubmissionService {
  private readonly auth=inject(AuthService);
  private readonly api=inject(CitizenCasesApiService);
  private readonly drafts=inject(CaseDraftService);
  private readonly state=signal<CaseReceipt|null>(null);
  readonly receipt=computed(()=>this.state()?.owner===this.auth.user()?.id_usuario?this.state():null);
  submit(payload:CreateCaseRequest,files:readonly File[]) {
    const owner=this.auth.user()?.id_usuario ?? '';
    return this.api.create(payload).pipe(
      tap(caso=>{
        this.state.set({owner,caso,attachments:files.map(file=>({name:file.name,uploaded:false,error:''}))});
        if(owner===this.auth.user()?.id_usuario)this.drafts.clear();
      }),
      switchMap(caso=>from(files).pipe(
        concatMap((file,index)=>this.api.upload(caso.id_caso,file).pipe(
          map(()=>({index,uploaded:true,error:''})),
          catchError(error=>of({index,uploaded:false,error:apiErrorMessage(error)})),
          tap(result=>this.state.update(receipt=>receipt?.caso.id_caso===caso.id_caso && receipt.owner===owner?{...receipt,attachments:receipt.attachments.map((item,i)=>i===index?{...item,uploaded:result.uploaded,error:result.error}:item)}:receipt)),
        )),toArray(),map(()=>caso),
      )),
    );
  }
  clear() {this.state.set(null);}
}
