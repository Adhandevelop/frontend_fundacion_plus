import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, of } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminNewsApiService, AdminNewsCategory } from './services/admin-news-api.service';
import { EditorialPreviewComponent } from './components/editorial-preview.component';

@Component({selector:'plus-news-editor',standalone:true,imports:[RouterLink,ReactiveFormsModule,EditorialPreviewComponent],templateUrl:'./news-editor.component.html'})
export class NewsEditorComponent {
 private readonly api=inject(AdminNewsApiService);private readonly route=inject(ActivatedRoute);private readonly router=inject(Router);private readonly destroy=inject(DestroyRef);private readonly builder=inject(FormBuilder).nonNullable;
 readonly id=signal(this.route.snapshot.paramMap.get('id'));readonly categories=signal<AdminNewsCategory[]>([]);readonly preview=signal(false);readonly loading=signal(true);readonly saving=signal(false);readonly missing=signal(false);readonly status=signal('');readonly cover=signal('');readonly slug=signal('');
 readonly form=this.builder.group({title:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(220)]],categoryId:['',Validators.required],summary:['',[Validators.required,Validators.pattern(/\S/)]],body:['',[Validators.required,Validators.pattern(/\S/)]],featured:[false]});
 constructor(){const id=this.id();forkJoin({categories:this.api.categories(),article:id?this.api.detail(id):of(null)}).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:({categories,article})=>{this.categories.set(categories.filter(value=>value.active));if(article){this.form.setValue({title:article.title,categoryId:article.categoryId,summary:article.summary,body:article.body,featured:article.featured});this.cover.set(article.cover);this.slug.set(article.slug);}},error:error=>{this.missing.set(!!id);this.status.set(apiErrorMessage(error));}});}
 previewValue(){const value=this.form.getRawValue();return{title:value.title,slug:this.slug(),category:this.categories().find(item=>item.id===value.categoryId)?.name??'',summary:value.summary,body:value.body,imageUrl:this.cover(),imageAlt:value.title};}
 save(){this.form.markAllAsTouched();if(this.form.invalid||this.saving())return;this.saving.set(true);this.status.set('');const value=this.form.getRawValue(),request=this.id()?this.api.update(this.id()!,value):this.api.create(value);request.pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.saving.set(false))).subscribe({next:article=>void this.router.navigate(['/admin/noticias',article.id],{queryParams:{resultado:'guardado'}}),error:error=>this.status.set(apiErrorMessage(error))});}
}
