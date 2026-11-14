import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription } from 'rxjs';
import { AdminCasesApiService } from './admin-cases-api.service';
import { AdminAction, AdminCase, CandidatePage } from './admin-cases.models';
import { CaseEvidence, caseStateLabel } from '../../citizen/services/citizen-cases.models';
import { apiErrorMessage } from '../../../core/api/api-error';
import { LocationPickerComponent } from '../../citizen/intake/location-picker/location-picker.component';

interface ActionReview {caseId:string;action:AdminAction;permission:string;title:string;summary:string}
export function adminCaseCoordinates(caso:AdminCase):{latitude:number;longitude:number}|null {
  const raw=caso.ubicacion??caso.public_location;let location=typeof raw==='object'&&raw?raw:undefined;
  if(typeof raw==='string'){try{const parsed=JSON.parse(raw);if(parsed&&typeof parsed==='object')location=parsed;}catch{const point=raw.match(/POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i);if(point){const longitude=Number(point[1]),latitude=Number(point[2]);if(Number.isFinite(latitude)&&Number.isFinite(longitude))return{latitude,longitude};}}}
  const coordinates=location?.coordinates;
  const latitude=Number(caso.latitud??caso.latitude??location?.latitud??location?.latitude??location?.lat??coordinates?.[1]);
  const longitude=Number(caso.longitud??caso.longitude??location?.longitud??location?.longitude??location?.lng??coordinates?.[0]);
  return Number.isFinite(latitude)&&Number.isFinite(longitude)&&latitude>=-90&&latitude<=90&&longitude>=-180&&longitude<=180?{latitude,longitude}:null;
}
@Component({selector:'plus-admin-case-detail',standalone:true,imports:[DatePipe,RouterLink,ReactiveFormsModule,LocationPickerComponent],templateUrl:'./admin-case-detail.component.html'})
export class AdminCaseDetailComponent {
  private readonly api=inject(AdminCasesApiService);
  private readonly destroy=inject(DestroyRef);
  private readonly builder=inject(FormBuilder).nonNullable;
  private reference='';private revision=0;private candidateRevision=0;
  private request?:Subscription;private candidateRequest?:Subscription;
  readonly data=signal<AdminCase|null>(null);readonly loading=signal(true);readonly error=signal('');readonly status=signal('');readonly pending=signal(false);readonly uncertain=signal(false);
  readonly tab=signal('overview');readonly review=signal<ActionReview|null>(null);
  readonly candidates=signal<CandidatePage>({count:0,next:null,previous:null,results:[]});readonly candidatePage=signal(1);readonly candidateQuery=signal('');readonly candidateLoading=signal(false);readonly candidateError=signal('');
  readonly evidenceId=signal('');readonly selectedEvidenceFile=signal<File|null>(null);readonly label=caseStateLabel;
  readonly progressFiles=signal<File[]>([]);
  readonly editingLocation=signal(false);readonly locationReview=signal(false);readonly locationLatitude=signal<number|null>(null);readonly locationLongitude=signal<number|null>(null);
  readonly tabs=[{id:'overview',label:'Resumen'},{id:'history',label:'Seguimiento'},{id:'evidence',label:'Evidencias'},{id:'management',label:'Gestión del caso'}];
  private readonly requiredText=[Validators.required,Validators.pattern(/\S/),Validators.maxLength(2000)];
  readonly moderation=this.builder.group({publication:['pendiente',Validators.required],priority:['media',Validators.required],reason:['',this.requiredText]});
  readonly correction=this.builder.group({reason:['',this.requiredText]});
  readonly assignment=this.builder.group({responsible:['',Validators.required],reason:['',this.requiredText]});
  readonly progress=this.builder.group({title:['',[Validators.required,Validators.maxLength(200),Validators.pattern(/\S/)]],description:['',this.requiredText],audience:['interno',Validators.required],state:[''],evidenceDescription:['',Validators.maxLength(2000)]});
  readonly resolution=this.builder.group({state:['resuelto',Validators.required],reason:['',this.requiredText],result:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(5000)]]});
  readonly evidence=this.builder.group({description:['',Validators.maxLength(2000)],audience:['ciudadano',Validators.required],review:['pendiente',Validators.required]});
  readonly evidenceUpload=this.builder.group({name:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(180)]],description:['',Validators.maxLength(2000)]});
  constructor(){inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(params=>{
    this.reference=params.get('radicado') ?? '';this.data.set(null);this.tab.set('overview');this.status.set('');this.pending.set(false);this.review.set(null);this.evidenceId.set('');this.selectedEvidenceFile.set(null);this.progressFiles.set([]);this.candidatePage.set(1);this.candidateQuery.set('');this.resetForms();this.load();
  });}
  load(){
    const revision=++this.revision;this.request?.unsubscribe();this.candidateRequest?.unsubscribe();this.loading.set(true);this.error.set('');this.review.set(null);
    this.request=this.api.detail(this.reference).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.loading.set(false);})).subscribe({next:value=>{
      if(revision!==this.revision)return;this.data.set(value);this.uncertain.set(false);this.restoreLocation(value);this.moderation.patchValue({publication:value.estado_publicacion,priority:value.prioridad});
      if(this.can('assign'))this.loadCandidates();else this.candidates.set({count:0,next:null,previous:null,results:[]});
    },error:error=>{if(revision===this.revision)this.error.set(apiErrorMessage(error));}});
  }
  can(action:string){return this.data()?.allowed_actions.includes(action) ?? false;}
  selectTab(value:string){if(this.pending() || this.review())return;this.tab.set(value);}
  private restoreLocation(caso:AdminCase){const location=adminCaseCoordinates(caso);this.locationLatitude.set(location?.latitude??null);this.locationLongitude.set(location?.longitude??null);this.editingLocation.set(false);this.locationReview.set(false);}
  startLocationEdit(){if(!this.can('moderate')||this.pending())return;this.editingLocation.set(true);this.locationReview.set(false);this.status.set('Selecciona el punto correcto y revísalo antes de guardar.');}
  setLocation(value:{latitude:number;longitude:number}|null){this.locationLatitude.set(value?.latitude??null);this.locationLongitude.set(value?.longitude??null);this.locationReview.set(false);}
  reviewLocation(){if(this.locationLatitude()===null||this.locationLongitude()===null){this.status.set('Selecciona un punto en el mapa antes de continuar.');return;}this.locationReview.set(true);this.status.set('Confirma la nueva ubicación del expediente.');}
  cancelLocation(){const caso=this.data();if(caso)this.restoreLocation(caso);this.status.set('Edición de ubicación cancelada.');}
  saveLocation(){const caso=this.data(),latitude=this.locationLatitude(),longitude=this.locationLongitude();if(!caso||latitude===null||longitude===null||!this.locationReview()||this.pending()||!this.can('moderate'))return;const revision=this.revision;this.pending.set(true);this.status.set('');this.api.updateLocation(caso.id_caso,latitude,longitude).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.pending.set(false);})).subscribe({next:()=>{if(revision!==this.revision)return;this.status.set('Ubicación actualizada. Si el caso está aprobado, ya puede incorporarse al mapa público.');this.load();},error:error=>{if(revision===this.revision){this.locationReview.set(false);this.status.set(apiErrorMessage(error));}}});}
  private resetForms(){this.moderation.reset();this.correction.reset();this.assignment.reset();this.progress.reset();this.resolution.reset();this.evidence.reset();this.evidenceUpload.reset();}
  loadCandidates(){
    const caso=this.data();if(!caso || !this.can('assign'))return;
    const revision=this.revision,candidateRevision=++this.candidateRevision;this.candidateRequest?.unsubscribe();this.assignment.controls.responsible.reset();this.candidateLoading.set(true);this.candidateError.set('');
    this.candidateRequest=this.api.candidates(caso.id_caso,this.candidateQuery().trim(),this.candidatePage()).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(candidateRevision===this.candidateRevision)this.candidateLoading.set(false);})).subscribe({next:value=>{
      if(revision===this.revision && candidateRevision===this.candidateRevision)this.candidates.set(value);
    },error:error=>{if(revision===this.revision && candidateRevision===this.candidateRevision)this.candidateError.set(apiErrorMessage(error));}});
  }
  searchCandidates(){this.candidatePage.set(1);this.loadCandidates();}
  nextCandidates(delta:number){const next=this.candidatePage()+delta;if(next<1 || (delta>0 && !this.candidates().next))return;this.candidatePage.set(next);this.loadCandidates();}
  prepare(kind:'moderation'|'correction'|'assignment'|'progress'|'resolution'|'evidence'){
    const caso=this.data();if(!caso || this.pending() || this.loading() || this.uncertain())return;
    const form={moderation:this.moderation,correction:this.correction,assignment:this.assignment,progress:this.progress,resolution:this.resolution,evidence:this.evidence}[kind];
    form.markAllAsTouched();if(form.invalid){this.status.set('Completa los campos obligatorios y revisa su longitud antes de continuar.');return;}
    let action:AdminAction,permission:string,title:string,summary:string;
    if(kind==='moderation'){
      this.moderation.markAllAsTouched();if(this.moderation.invalid)return;const value=this.moderation.getRawValue();
      action={kind:'moderation',payload:{estado_publicacion:value.publication,prioridad:value.priority,motivo:value.reason.trim()}};permission='moderate';title='Cambiar publicación';summary=`Publicación: ${this.label(value.publication)}. Prioridad: ${this.label(value.priority)}. Motivo: ${value.reason.trim()}`;
    }else if(kind==='correction'){
      this.correction.markAllAsTouched();if(this.correction.invalid)return;const reason=this.correction.controls.reason.value.trim();
      action={kind:'correction-requests',payload:{motivo:reason}};permission='request_correction';title='Solicitar información al ciudadano';summary=reason;
    }else if(kind==='assignment'){
      this.assignment.markAllAsTouched();if(this.assignment.invalid || this.candidateLoading() || this.candidateError())return;const value=this.assignment.getRawValue();
      const candidate=this.candidates().results.find(item=>item.id_usuario===value.responsible && item.estado==='activo' && ['representante','administrador'].includes(item.primary_role));if(!candidate){this.status.set('Selecciona un responsable disponible.');return;}
      action={kind:'assignments',payload:{id_responsable:candidate.id_usuario,motivo:value.reason.trim()}};permission='assign';title='Asignar responsable';summary=`${candidate.nombres} ${candidate.apellidos}. Motivo: ${value.reason.trim()}`;
    }else if(kind==='progress'){
      this.progress.markAllAsTouched();if(this.progress.invalid)return;const value=this.progress.getRawValue();
      action={kind:'progress',payload:{titulo:value.title.trim(),descripcion:value.description.trim(),audiencia:value.audience,visible_publicamente:value.audience==='publico',...(value.state?{estado:value.state}:{})},files:this.progressFiles(),evidenceDescription:value.evidenceDescription};permission='progress';title='Registrar seguimiento';summary=`${value.title.trim()}\nAudiencia: ${this.audienceLabel(value.audience)}${value.state?'\nEstado operativo: '+this.label(value.state):''}\nDocumentos: ${this.progressFiles().length}\n${value.description.trim()}`;
    }else if(kind==='resolution'){
      this.resolution.markAllAsTouched();if(this.resolution.invalid)return;const value=this.resolution.getRawValue();
      action={kind:'resolution',payload:{estado:value.state,motivo:value.reason.trim(),resultado_resumen:value.result.trim()}};permission='resolve';title='Resolver o cerrar caso';summary=`Estado: ${this.label(value.state)}\nMotivo: ${value.reason.trim()}\nResultado: ${value.result.trim()}`;
    }else{
      this.evidence.markAllAsTouched();if(this.evidence.invalid || !caso.evidencias.some(item=>item.id_evidencia===this.evidenceId()))return;const value=this.evidence.getRawValue();
      action={kind:'evidence',evidenceId:this.evidenceId(),payload:{descripcion:value.description.trim(),audiencia:value.audience,estado_revision:value.review}};permission='manage_evidence';title='Revisar evidencia';summary=`Audiencia: ${this.audienceLabel(value.audience)}. Revisión: ${value.review}. ${value.description.trim()}`;
    }
    if(!this.can(permission))return;
    this.review.set({caseId:caso.id_caso,action,permission,title,summary});this.status.set('Revisa la confirmación antes de guardar.');
    if(typeof document!=='undefined')setTimeout(()=>document.getElementById('admin-action-confirmation')?.focus(),0);
  }
  confirm(){
    const review=this.review();if(!review || this.pending() || this.data()?.id_caso!==review.caseId || !this.can(review.permission))return;
    const revision=this.revision;this.pending.set(true);this.status.set('');
    this.api.action(review.caseId,review.action).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.pending.set(false);})).subscribe({next:()=>{
      if(revision!==this.revision)return;this.pending.set(false);this.review.set(null);this.progressFiles.set([]);this.resetForms();this.evidenceId.set('');this.status.set('Acción confirmada por el servidor.');this.load();
    },error:error=>{
      if(revision!==this.revision)return;this.review.set(null);
      if(!(error instanceof HttpErrorResponse) || error.status===0 || error.status>=500){this.uncertain.set(true);this.status.set('No se pudo confirmar el resultado. Actualiza el expediente y revisa el historial antes de repetir la acción.');}
      else this.status.set(apiErrorMessage(error));
    }});
  }
  editEvidence(item:CaseEvidence){if(!this.can('manage_evidence') || this.pending())return;this.evidenceId.set(item.id_evidencia);this.evidence.reset({description:item.descripcion ?? '',audience:item.audiencia,review:item.estado_revision});}
  selectProgressFiles(event:Event){const input=event.target as HTMLInputElement,files=Array.from(input.files??[]);input.value='';const accepted=files.filter(file=>['jpg','jpeg','png','webp','gif','mp4','mov','webm','pdf'].includes(file.name.split('.').pop()?.toLowerCase()??'')&&file.size<=15728640),rejected=files.filter(file=>!accepted.includes(file));this.progressFiles.set(accepted);this.status.set(rejected.length?'Algunos archivos no se aceptaron. Usa formatos permitidos de hasta 15 MB por archivo.':accepted.length?`${accepted.length} documento(s) listos para adjuntar al seguimiento.`:'');}
  selectEvidenceFile(event:Event){const input=event.target as HTMLInputElement,file=input.files?.[0]??null;input.value='';if(!file)return;if(!['jpg','jpeg','png','webp','pdf'].includes(file.name.split('.').pop()?.toLowerCase()??'')||file.size>15728640){this.status.set('Selecciona JPG, PNG, WEBP o PDF de hasta 15 MB.');return;}this.selectedEvidenceFile.set(file);this.evidenceUpload.controls.name.setValue(file.name.replace(/\.[^.]+$/,''));this.status.set('Archivo seleccionado. Asigna el nombre que tendrá dentro del expediente.');}
  uploadEvidence(){const caso=this.data(),file=this.selectedEvidenceFile();if(!caso||!file||this.pending()||!this.can('manage_evidence'))return;this.evidenceUpload.markAllAsTouched();if(this.evidenceUpload.invalid)return;const value=this.evidenceUpload.getRawValue(),extension=file.name.match(/\.[A-Za-z0-9]+$/)?.[0]??'',safeName=value.name.trim().replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').slice(0,180),namedFile=new File([file],`${safeName}${extension}`,{type:file.type,lastModified:file.lastModified}),revision=this.revision;this.pending.set(true);this.status.set('');this.api.uploadEvidence(caso.id_caso,namedFile,value.description).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.pending.set(false);})).subscribe({next:()=>{if(revision!==this.revision)return;this.selectedEvidenceFile.set(null);this.evidenceUpload.reset();this.status.set('Documento administrativo añadido al expediente. Revisa su audiencia antes de compartirlo.');this.load();},error:error=>{if(revision===this.revision)this.status.set(apiErrorMessage(error)+' Revisa las evidencias antes de volver a enviarlo.');}});}
  download(item:CaseEvidence){
    const caso=this.data();if(!caso || this.pending())return;const revision=this.revision;this.pending.set(true);
    this.api.download(caso.id_caso,item.id_evidencia).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.pending.set(false);})).subscribe({next:blob=>{
      if(revision!==this.revision)return;if(blob.type.includes('json')){this.status.set('No está disponible el archivo para descargar.');return;}
      const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=item.nombre_original || 'evidencia';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    },error:error=>{if(revision===this.revision)this.status.set(apiErrorMessage(error));}});
  }
  audienceLabel(value:string){return ({interno:'Solo equipo interno',privado:'Privada',ciudadano:'Visible para el ciudadano',publico:'Pública'} as Record<string,string>)[value] ?? value;}
}
