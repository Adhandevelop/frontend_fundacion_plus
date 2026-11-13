import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { CitizenCasesApiService } from '../services/citizen-cases-api.service';
import { CitizenCase, CaseEvidence, CaseHistory, caseStateLabel } from '../services/citizen-cases.models';
import { apiErrorMessage } from '../../../core/api/api-error';

@Component({selector:'plus-citizen-case-detail',standalone:true,imports:[DatePipe,DecimalPipe,RouterLink,ReactiveFormsModule],templateUrl:'./citizen-case-detail.component.html'})
export class CitizenCaseDetailComponent {
  private readonly api=inject(CitizenCasesApiService);
  private readonly destroy=inject(DestroyRef);
  private readonly builder=inject(FormBuilder).nonNullable;
  private reference='';
  private revision=0;
  readonly data=signal<CitizenCase|null>(null);
  readonly loading=signal(true);
  readonly error=signal('');
  readonly history=signal<CaseHistory|null>(null);
  readonly historyLoading=signal(false);
  readonly historyError=signal('');
  readonly status=signal('');
  readonly pending=signal(false);
  readonly tab=signal('overview');
  readonly selectedFile=signal<File|null>(null);
  readonly label=caseStateLabel;
  readonly evidenceForm=this.builder.group({name:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(180)]],description:['',Validators.maxLength(2000)]});
  readonly contribution=this.builder.group({content:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(5000)]],correction:['']});
  readonly tabs=[{id:'overview',label:'Resumen'},{id:'history',label:'Seguimiento'},{id:'evidence',label:'Evidencias'},{id:'contribution',label:'Aportar información'}];
  constructor(){
    const route=inject(ActivatedRoute);
    route.paramMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(params=>{
      this.reference=params.get('radicado') ?? '';this.pending.set(false);this.status.set('');this.selectedFile.set(null);this.evidenceForm.reset();this.contribution.reset();this.selectSection(route.snapshot.queryParamMap.get('seccion'));this.data.set(null);this.load();
    });
    route.queryParamMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(params=>this.selectSection(params.get('seccion')));
  }
  private selectSection(section:string|null){this.tab.set(this.tabs.some(item=>item.id===section)?section!:'overview');}
  load(){
    const revision=++this.revision;this.loading.set(true);this.error.set('');
    this.api.detail(this.reference).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.loading.set(false);})).subscribe({next:value=>{if(revision===this.revision){this.data.set(value);this.loadHistory();}},error:error=>{if(revision===this.revision)this.error.set(apiErrorMessage(error));}});
  }
  loadHistory(){
    const caso=this.data();if(!caso)return;
    const revision=this.revision;this.history.set(null);this.historyLoading.set(true);this.historyError.set('');
    this.api.history(caso.id_caso).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.historyLoading.set(false);})).subscribe({next:value=>{if(revision===this.revision)this.history.set(value);},error:error=>{if(revision===this.revision)this.historyError.set(apiErrorMessage(error));}});
  }
  can(action:string){return this.data()?.allowed_actions.includes(action) ?? false;}
  selectFile(event:Event){
    const input=event.target as HTMLInputElement;const file=input.files?.[0];input.value='';if(!file)return;
    if(!['jpg','jpeg','png','webp','pdf'].includes(file.name.split('.').pop()?.toLowerCase() ?? '') || file.size>15728640){this.status.set('Selecciona JPG, PNG, WEBP o PDF de hasta 15 MB.');return;}
    this.selectedFile.set(file);this.evidenceForm.controls.name.setValue(file.name.replace(/\.[^.]+$/,''));this.status.set('Archivo seleccionado. Asigna un nombre claro antes de enviarlo.');
  }
  upload(){
    const file=this.selectedFile(),caso=this.data();if(!file || !caso || this.pending() || !this.can('upload_evidence'))return;
    this.evidenceForm.markAllAsTouched();if(this.evidenceForm.invalid)return;
    const value=this.evidenceForm.getRawValue(),extension=file.name.match(/\.[A-Za-z0-9]+$/)?.[0]??'',safeName=value.name.trim().replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').slice(0,180),namedFile=new File([file],`${safeName}${extension}`,{type:file.type,lastModified:file.lastModified});
    const revision=this.revision;this.pending.set(true);this.status.set('');
    this.api.upload(caso.id_caso,namedFile,value.description).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.pending.set(false);})).subscribe({next:()=>{
      if(revision!==this.revision)return;this.pending.set(false);this.selectedFile.set(null);this.evidenceForm.reset();this.status.set('Documento añadido al expediente.');this.load();
    },error:error=>{if(revision===this.revision)this.status.set(apiErrorMessage(error)+' Revisa las evidencias antes de reintentar para evitar duplicados.');}});
  }
  sendContribution(){
    const caso=this.data();if(!caso || this.pending() || !this.can('contribute'))return;
    this.contribution.markAllAsTouched();if(this.contribution.invalid)return;
    const value=this.contribution.getRawValue(),revision=this.revision;this.pending.set(true);this.status.set('');
    this.api.contribute(caso.id_caso,value.content.trim(),value.correction || undefined).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.pending.set(false);})).subscribe({next:()=>{
      if(revision!==this.revision)return;this.pending.set(false);this.contribution.reset();this.status.set('Información enviada al equipo de PLUS.');this.load();
    },error:error=>{if(revision===this.revision)this.status.set(apiErrorMessage(error)+' Revisa los aportes antes de reintentar.');}});
  }
  download(evidence:CaseEvidence){
    const caso=this.data();if(!caso || this.pending())return;
    const revision=this.revision;this.pending.set(true);this.status.set('');
    this.api.download(caso.id_caso,evidence.id_evidencia).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.pending.set(false);})).subscribe({next:blob=>{
      if(revision!==this.revision)return;
      if(blob.type.includes('json')){this.status.set('El archivo no está disponible para descargar.');return;}
      const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=evidence.nombre_original || 'evidencia';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    },error:error=>{if(revision===this.revision)this.status.set(apiErrorMessage(error));}});
  }
}
