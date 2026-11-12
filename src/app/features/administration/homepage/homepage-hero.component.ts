import { Component, DestroyRef, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { HomepageApiService, homepageImageUrl, HomepageHero } from '../../../core/api/homepage-api.service';
import { apiErrorMessage } from '../../../core/api/api-error';

@Component({selector:'plus-homepage-hero',standalone:true,imports:[FormsModule],templateUrl:'./homepage-hero.component.html'})
export class HomepageHeroComponent implements OnDestroy {
 private readonly api=inject(HomepageApiService);private readonly destroy=inject(DestroyRef);private objectUrl='';
 readonly hero=signal<HomepageHero|null>(null);readonly loading=signal(true);readonly saving=signal(false);readonly error=signal('');readonly status=signal('');readonly preview=signal('');
 altText='';file:File|null=null;
 constructor(){this.api.hero().pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>{this.hero.set(value);this.altText=value.alt_text;this.preview.set(this.image(value));},error:error=>this.error.set(apiErrorMessage(error))});}
 choose(event:Event){const input=event.target as HTMLInputElement,file=input.files?.[0]??null;this.error.set('');this.status.set('');if(!file){this.resetSelection();return;}if(!['image/jpeg','image/png','image/webp'].includes(file.type)){this.resetSelection();this.error.set('Selecciona una imagen JPG, PNG o WEBP.');input.value='';return;}if(file.size>5*1024*1024){this.resetSelection();this.error.set('La imagen no puede superar 5 MB.');input.value='';return;}this.file=file;this.releasePreview();this.objectUrl=URL.createObjectURL(file);this.preview.set(this.objectUrl);}
 save(){if(this.saving()||(!this.file&&this.altText.trim()===this.hero()?.alt_text))return;if(!this.altText.trim()){this.error.set('El texto alternativo es obligatorio para describir la fotografía.');return;}this.saving.set(true);this.error.set('');this.status.set('');this.api.updateHero(this.file,this.altText).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.saving.set(false))).subscribe({next:value=>{this.hero.set(value);this.altText=value.alt_text;this.file=null;this.releasePreview();this.preview.set(this.image(value));this.status.set('La fotografía principal quedó actualizada.');},error:error=>this.error.set(apiErrorMessage(error))});}
 ngOnDestroy(){this.releasePreview();}
 private image(value:HomepageHero){return homepageImageUrl(value);}
 private resetSelection(){this.file=null;this.releasePreview();const current=this.hero();this.preview.set(current?this.image(current):'');}
 private releasePreview(){if(this.objectUrl){URL.revokeObjectURL(this.objectUrl);this.objectUrl='';}}
}
