// Frontend fixtures from the mockup, not a REST contract.
export interface AdminCaseDemo {code:string;priority:string;title:string;territory:string;category:string;date:string;status:string;assignee:string;term?:string;}
export const ADMIN_CASES_DEMO: readonly AdminCaseDemo[] = [
  {
    "code": "PLUS-2025-084",
    "priority": "Prioridad Alta",
    "title": "Rehabilitación urgente de vía terciaria y alcantarillado vereda El Porvenir",
    "territory": "Riosucio (Cuenca Cacarica)",
    "category": "Infraestructura",
    "date": "14 Feb 2025",
    "status": "En Revisión Prioritaria",
    "assignee": "Dr. Carlos Mario R."
  },
  {
    "code": "PLUS-2025-0719",
    "priority": "Radicado Ordinario",
    "title": "Falta de dotación y personal médico en puesto de salud Bellavista",
    "territory": "Bojayá (Cabecera)",
    "category": "Salud Pública",
    "date": "12 Feb 2025",
    "status": "Requiere Información",
    "assignee": "Dra. Liliana Mosquera"
  },
  {
    "code": "PLUS-2025-0601",
    "priority": "Radicado Ordinario",
    "title": "Veeduría a la construcción de puente peatonal sobre río Arquía",
    "territory": "Vigía del Fuerte",
    "category": "Obra Pública",
    "date": "08 Feb 2025",
    "status": "En Proceso (Mesa Técnica)",
    "assignee": "Ing. Andrés Perea"
  },
  {
    "code": "PLUS-2025-0488",
    "priority": "Radicado Concluido",
    "title": "Recuperación de la bocatoma de acueducto comunitario Curvaradó",
    "territory": "Carmen del Darién",
    "category": "Servicios Públicos",
    "date": "28 Ene 2025",
    "status": "Resuelto (Acta Firmada)",
    "assignee": "Dr. Carlos Mario R."
  },
  {
    "code": "PLUS-2025-0320",
    "priority": "Nuevo Radicado",
    "title": "Alerta por socavación en ribera del Atrato y amenaza a escuela rural",
    "territory": "Quibdó / Río Atrato",
    "category": "Gestión de Riesgo",
    "date": "22 Ene 2025",
    "status": "Pendiente Asignación",
    "assignee": "Sin Asignar"
  },
  {
    "code": "PLUS-2025-0215",
    "priority": "Prioridad Media",
    "title": "Seguimiento a compromisos de electrificación rural no interconectada",
    "territory": "Riosucio (Cuenca Jiguamiandó)",
    "category": "Servicios Públicos",
    "date": "19 Ene 2025",
    "status": "En Proceso (Mesa Técnica)",
    "assignee": "Dra. Liliana Mosquera"
  },
  {
    "code": "PLUS-2025-0180",
    "priority": "Radicado Ordinario",
    "title": "Inspección de obras de contención y dragado preventivo en el río Murindó",
    "territory": "Murindó (Cuenca Murindó)",
    "category": "Medio Ambiente",
    "date": "15 Ene 2025",
    "status": "Resuelto (Acta Firmada)",
    "assignee": "Ing. Andrés Perea"
  },
  {
    "code": "PLUS-2025-0104",
    "priority": "Plazo < 48h",
    "title": "Requerimiento técnico-sanitario por turbiedad en suministro de agua potable",
    "territory": "Bojayá (Comunidad Pogue)",
    "category": "Salud Rural",
    "date": "10 Ene 2025",
    "status": "En Revisión Prioritaria",
    "assignee": "Dr. Carlos Mario R."
  }
];

export const DASHBOARD_CASES_DEMO: readonly AdminCaseDemo[] = [
  {
    "code": "PLUS-2025-084",
    "title": "Rehabilitación urgente de vía terciaria y drenajes",
    "priority": "Ejemplo del despacho",
    "territory": "Riosucio Vereda El Porvenir",
    "category": "",
    "date": "",
    "status": "Mesa Técnica",
    "assignee": "Por confirmar",
    "term": "3 días hábiles"
  },
  {
    "code": "PLUS-2025-0719",
    "title": "Dotación y personal médico Puesto de Salud",
    "priority": "Ejemplo del despacho",
    "territory": "Riosucio Cabecera Urbana",
    "category": "",
    "date": "",
    "status": "Urgente / Preclusivo",
    "assignee": "Por confirmar",
    "term": "&lt; 24 horas"
  },
  {
    "code": "PLUS-2025-0601",
    "title": "Veeduría puente peatonal sobre río Arquía",
    "priority": "Ejemplo del despacho",
    "territory": "Vigía del Fuerte Sector Vega",
    "category": "",
    "date": "",
    "status": "Inspección de Obra",
    "assignee": "Por confirmar",
    "term": "Al día (En cronograma)"
  },
  {
    "code": "PLUS-2025-0488",
    "title": "Alerta socavación muro de contención fluvial",
    "priority": "Ejemplo del despacho",
    "territory": "Bojayá Bellavista Nueva",
    "category": "",
    "date": "",
    "status": "Requiere Inspección",
    "assignee": "Por confirmar",
    "term": "5 días restantes"
  }
];
