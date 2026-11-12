import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { apiErrorMessage } from '../../../core/api/api-error';
import { editorialFileKind } from '../../../shared/editorial-media';
import { AdminNewsApiService, AdminNewsArticle, NEWS_STATE_LABELS, NewsState } from './services/admin-news-api.service';
import { EditorialPreviewComponent } from './components/editorial-preview.component';

@Component({selector:'plus-news-review',standalone:true,imports:[RouterLink,DatePipe,DecimalPipe,ReactiveFormsModule,EditorialPreviewComponent],templateUrl:'./news-review.component.html'})
export class NewsReviewComponent {
 private readonly api=inject(AdminNewsApiService);private readonly destroy=inject(DestroyRef);private readonly builder=inject(FormBuilder).nonNullable;readonly labels=NEWS_STATE_LABELS;readonly id=inject(ActivatedRoute).snapshot.paramMap.get('id')??'';
 readonly record=signal<AdminNewsArticle|null>(null);readonly loading=signal(true);readonly pending=signal<NewsState|null>(null);readonly busy=signal(false);readonly uploading=signal(false);readonly selectedFile=signal<File|null>(null);readonly removingMedia=signal('');readonly status=signal('');
 readonly mediaForm=this.builder.group({alt:['',Validators.maxLength(250)],description:[''],cover:[false],order:[0,[Validators.required,Validators.min(0),Validators.pattern(/^\d+$/)]]});
 constructor(){this.load();}
 load(){this.loading.set(true);this.api.detail(this.id).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>this.record.set(value),error:error=>this.status.set(apiErrorMessage(error))});}
 previewValue(){const row=this.record();return{title:row?.title??'',slug:row?.slug??'',category:row?.categoryName??'',summary:row?.summary??'',body:row?.body??'',imageUrl:row?.cover??'',imageAlt:row?.title??''};}
 confirm(){const state=this.pending();if(!state||this.busy())return;this.busy.set(true);this.status.set('');this.api.transition(this.id,state).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.busy.set(false))).subscribe({next:value=>{this.record.set(value);this.pending.set(null);this.status.set('Estado editorial actualizado en PLUS.');},error:error=>this.status.set(apiErrorMessage(error))});}
 feature(){const row=this.record();if(!row||row.state!=='publicada'||this.busy())return;this.busy.set(true);this.api.transition(this.id,row.state,!row.featured).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.busy.set(false))).subscribe({next:value=>{this.record.set(value);this.status.set('Estado destacado actualizado.');},error:error=>this.status.set(apiErrorMessage(error))});}
 selectFile(event:Event){const input=event.target as HTMLInputElement;const file=input.files?.[0]??null;input.value='';if(!file)return;if(!editorialFileKind(file)){this.selectedFile.set(null);this.status.set('Archivo no admitido. Usa JPG, PNG, WEBP, GIF, MP4, MOV, WEBM o PDF de máximo 15 MB.');return;}this.selectedFile.set(file);this.status.set('Archivo listo para subir.');}
 upload(){const file=this.selectedFile(),kind=file?editorialFileKind(file):null;this.mediaForm.markAllAsTouched();if(!file||!kind||this.mediaForm.invalid||this.uploading())return;const value=this.mediaForm.getRawValue();if(kind==='imagen'&&!value.alt.trim()){this.status.set('El texto alternativo es obligatorio para imágenes.');return;}this.uploading.set(true);this.status.set('');this.api.uploadMedia(this.id,file,value).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.uploading.set(false))).subscribe({next:()=>{this.selectedFile.set(null);this.mediaForm.reset({alt:'',description:'',cover:false,order:0});this.status.set('Medio cargado correctamente.');this.load();},error:error=>this.status.set(apiErrorMessage(error))});}
 removeMedia(){const id=this.removingMedia();if(!id||this.busy())return;this.busy.set(true);this.api.deleteMedia(id).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.busy.set(false))).subscribe({next:()=>{this.removingMedia.set('');this.status.set('Medio eliminado.');this.load();},error:error=>this.status.set(apiErrorMessage(error))});}
}
