import { Component, input } from '@angular/core';
import { EditorialNewsInput } from '../data/editorial-news.demo';

@Component({selector: 'plus-editorial-preview', standalone: true, template: `
  <article class="admin-panel border rounded-xl overflow-hidden">
    @if(article().imageUrl){<img [src]="article().imageUrl" [alt]="article().imageAlt" class="w-full max-h-96 object-cover">}
    <div class="p-5 sm:p-8 space-y-5"><p class="text-label-sm uppercase tracking-wider">Vista previa local · {{article().category || 'Sin categoría'}}</p>
      <h2 class="text-headline-md break-words">{{article().title || 'Título de la noticia'}}</h2>
      <p class="text-title-sm whitespace-pre-wrap break-words">{{article().summary || 'El extracto aparecerá aquí.'}}</p>
      <div class="text-body-md whitespace-pre-wrap break-words leading-relaxed">{{article().body || 'El contenido aparecerá aquí.'}}</div>
    </div>
  </article>
`})
export class EditorialPreviewComponent {readonly article = input.required<EditorialNewsInput>();}
