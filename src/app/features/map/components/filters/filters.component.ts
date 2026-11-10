import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'plus-map-filters',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './filters.component.html',
})
export class MapFiltersComponent {
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly form = this.builder.group({
    department: 'Meta',
    municipality: 'Villavicencio',
    community: '',
    kind: 'all',
    roads: true, water: true, health: false, education: true, environment: false,
    active: true, review: true, resolved: false,
    from: '', to: '',
  });
  readonly message = signal('');
  selectedCategories() {
    const values = this.form.getRawValue();
    return [values.roads, values.water, values.health, values.education, values.environment].filter(Boolean).length;
  }
  apply() {
    const { from, to } = this.form.getRawValue();
    this.message.set(from && to && from > to
      ? 'La fecha inicial debe ser anterior o igual a la fecha final.'
      : 'Filtros preparados. La consulta de resultados estará disponible al conectar la API.');
  }
  reset() { this.form.reset(); this.message.set('Filtros restablecidos.'); }
}
