// Local UI fixtures from the supplied mockup; these are not REST contracts.
export interface CitizenCaseDemo {code:string;title:string;kind:string;territory:string;status:string;updated:string;}
export const CASES_DEMO: readonly CitizenCaseDemo[] = [
  {
    "code": "PLUS-2025-084",
    "title": "Rehabilitación urgente de vía terciaria y alcantarillado vereda El Porvenir",
    "kind": "Problemática",
    "territory": "Riosucio, Chocó",
    "status": "En proceso",
    "updated": "Hace 2 horas"
  },
  {
    "code": "PLUS-2025-0719",
    "title": "Falta de dotación de insumos médicos en el Puesto de Salud Cacarica",
    "kind": "Problemática",
    "territory": "Riosucio, Chocó",
    "status": "Pendiente de revisión",
    "updated": "Ayer, 4:30 PM"
  },
  {
    "code": "PLUS-2025-0601",
    "title": "Veeduría a la construcción de placa huella sector La Esperanza",
    "kind": "Proyecto / Iniciativa",
    "territory": "Vigía del Fuerte, Antioquia",
    "status": "En proceso",
    "updated": "12 Feb 2025"
  },
  {
    "code": "PLUS-2025-0488",
    "title": "Recuperación de la bocatoma de agua comunitaria El Salto",
    "kind": "Proyecto / Iniciativa",
    "territory": "Carmen del Darién, Chocó",
    "status": "Resuelto",
    "updated": "28 Ene 2025"
  },
  {
    "code": "PLUS-2025-0320",
    "title": "Alerta por socavación en ribera del río Atrato sector puente colgante",
    "kind": "Problemática",
    "territory": "Bojayá, Chocó",
    "status": "Requiere información",
    "updated": "Hace 3 días"
  }
];
