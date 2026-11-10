import { FormControl, FormGroup } from '@angular/forms';

// Form state: category and territory selections contain backend UUIDs.
export interface IntakeViewValue {
  kind: string;
  priority: string;
  title: string;
  category: string;
  description: string;
  families: number;
  months: number;
  department: string;
  municipality: string;
  community: string;
  latitude: number | null;
  longitude: number | null;
}
export type IntakeForm = FormGroup<{[K in keyof IntakeViewValue]: FormControl<IntakeViewValue[K]>}>;

export const EMPTY_INTAKE: IntakeViewValue = {
  kind: 'problematica', priority: 'media', title: '', category: '', description: '',
  families: 0, months: 0, department: '', municipality: '', community: '', latitude: null, longitude: null,
};

export const INTAKE_EXAMPLE: IntakeViewValue = {
  kind: 'Problemática comunitaria', priority: 'Alta (Urgente)',
  title: 'Rehabilitación urgente de vía terciaria y alcantarillado vereda El Porvenir',
  category: 'Infraestructura vial, puentes y drenajes rurales',
  description: 'El tramo carreteable que conecta la Vereda El Porvenir con la cabecera municipal presenta un colapso estructural severo y afectaciones en tres alcantarillas.\n\nLa situación afecta a 340 familias campesinas y dificulta el transporte de productos y el acceso a la escuela.\n\nLa comunidad solicita acompañamiento para documentar y dar seguimiento a la problemática.',
  families: 340, months: 8, department: 'Chocó', municipality: 'Riosucio',
  community: 'El Porvenir', latitude: 7.05333, longitude: -77.02917,
};
