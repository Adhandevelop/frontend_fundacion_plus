import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { editorialFileKind } from '../../../shared/editorial-media';
import { AdminInitiative, AdminInitiativesApiService } from './services/admin-initiatives-api.service';

@Component({selector:'plus-initiative-media',standalone:true,imports:[RouterLink,ReactiveFormsModule,DecimalPipe],templateUrl:'./initiative-media.component.html'})
export class InitiativeMediaComponent {
 private readonly api=inject(AdminInitiativesApiService);private readonly destroy=inject(DestroyRef);private readonly builder=inject(FormBuilder).nonNullable;private readonly route=inject(ActivatedRoute);
 readonly programId=this.route.snapshot.paramMap.get('programId')??'';readonly editionId=this.route.snapshot.paramMap.get('editionId');
 readonly record=signal<AdminInitiative|null>(null);readonly loading=signal(true);readonly uploading=signal(false);readonly selectedFile=signal<File|null>(null);readonly removing=signal('');readonly status=signal('');readonly query=signal('');readonly kind=signal('');
 readonly edition=computed(()=>this.record()?.editions.find(row=>row.id===this.editionId)??null);readonly valid=computed(()=>Boolean(this.record()&&(!this.editionId||this.edition())));readonly back=computed(()=>this.editionId?['/admin/iniciativas',this.programId,'ediciones',this.editionId]:['/admin/iniciativas',this.programId]);
 readonly rows=computed(()=>{const normalize=(value:string)=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');return(this.record()?.media??[]).filter(row=>row.editionId===this.editionId&&(!this.kind()||row.kind===this.kind())&&normalize(`${row.alt} ${row.description} ${row.path}`).includes(normalize(this.query().trim()))).sort((a,b)=>a.order-b.order);});
 readonly form=this.builder.group({alt:['',Validators.maxLength(250)],description:[''],cover:[false],order:[0,[Validators.required,Validators.min(0),Validators.pattern(/^\d+$/)]]});
 constructor(){this.load();}
 load(){this.loading.set(true);this.api.detail(this.programId).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:row=>this.record.set(row),error:error=>this.status.set(apiErrorMessage(error))});}
 select(event:Event){const input=event.target as HTMLInputElement;const file=input.files?.[0]??null;input.value='';if(!file)return;if(!editorialFileKind(file)){this.selectedFile.set(null);this.status.set('Archivo no admitido. Usa JPG, PNG, WEBP, GIF, MP4, MOV, WEBM o PDF de máximo 15 MB.');return;}this.selectedFile.set(file);this.status.set('Archivo listo para subir.');}
 save(){const file=this.selectedFile(),mediaKind=file?editorialFileKind(file):null;this.form.markAllAsTouched();if(!file||!mediaKind||this.form.invalid||!this.valid()||this.uploading())return;const value=this.form.getRawValue();if(mediaKind==='imagen'&&!value.alt.trim()){this.status.set('El texto alternativo es obligatorio para imágenes.');return;}this.uploading.set(true);this.status.set('');this.api.uploadMedia(this.programId,this.editionId,file,value).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.uploading.set(false))).subscribe({next:media=>{this.record.update(row=>row?{...row,media:[...row.media.filter(item=>!media.cover||!item.cover||item.editionId!==media.editionId),media]}:row);this.selectedFile.set(null);this.form.reset({alt:'',description:'',cover:false,order:0});this.status.set('Medio cargado correctamente.');},error:error=>this.status.set(apiErrorMessage(error))});}
 remove(){const id=this.removing();if(!id)return;this.api.deleteMedia(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:()=>{this.record.update(row=>row?{...row,media:row.media.filter(item=>item.id!==id)}:row);this.removing.set('');this.status.set('Medio eliminado.');},error:error=>this.status.set(apiErrorMessage(error))});}
}
