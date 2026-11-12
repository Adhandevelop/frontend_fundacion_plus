// UI fixtures from the mockup; no API contract is implied.
export interface NewsDemo {id:string;slug?:string;title:string;summary:string;content?:string;image:string;imageAlt?:string;category:string;date:string;publishedAt?:string;order:number;featured:boolean;demo?:boolean;}
export const NEWS_DEMO: readonly NewsDemo[] = [
  {
    "id": "publicacion-0",
    "title": "Juan David Martínez Bolaño lidera mesa técnica interinstitucional para seguimiento a compromisos viales y de salud en el Atrato",
    "summary": "En el marco del mandato cívico y las competencias conferidas por la Ley 850 de 2003, la Corporación Pluralismo Social articuló un espacio de interlocución vinculante entre comités comunitarios de base, delegados de ministerios y contratistas ejecutores. Durante la jornada se establecieron cronogramas de entrega con penalidades contractuales y verificación satelital de avances.",
    "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuCXBDSJe05exet7bTIy_rj083HnCNmvQj5ciwQ57zGVgGHldKahqK7pbhRlTw-7Ws0Eofu74IkHzaEyG-8qIwP8fVztRkg5XLXiDAQKtaaS7LkulVod7DSTFQkrNM5i2s4j-_cru67YriEvVPxJCspWXPWiYs_0aU7iXSvev8Cw1eqZ0k2u2ywg0SlRNDXy0sd77JQY_76CwKDDubxSRHjlp_I2WJ1PiJEJnYf7IDJw",
    "category": "Actividades de Representación",
    "date": "18 de Febrero de 2025",
    "order": 0,
    "featured": true
  },
  {
    "id": "publicacion-1",
    "title": "Veeduría ciudadana verifica avance del 78% en obras de acueducto rural en Carmen del Darién",
    "summary": "Equipo de campo de PLUS constató la instalación de tanques desarenadores y redes primarias para más de 3.200 habitantes ribereños, exigiendo acelerar el cronograma del sistema de filtrado.",
    "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuD86iEs24EuTQ8SKP4Gz081_5c2zo4kF5Y6oUFMUMlQ2Bv3dsR-yQDcVo1B-yJ0qMhnIoyhaCd36ua5P_x-u-wQGye0tHi6Q7fEUroEWgeBJP1KLz3OlpRyh3pR1D1zzRBi0YF-g8Uw0-SHYFcXJH1apuKTB0JVAl0CYfztu7QwJCgkqH8tcfddlRemJJA7YKosptpEH-442nUDti30lmq52rCqwML1qjLdtwVj6Jjj",
    "category": "Veeduría Territorial",
    "date": "15 Feb 2025",
    "order": 1,
    "featured": false
  },
  {
    "id": "publicacion-2",
    "title": "Juan David Martínez Bolaño participa en el Encuentro Regional de Veedurías y Transparencia Pública",
    "summary": "Durante el panel central, el representante de PLUS expuso la metodología de georreferenciación de recursos del OCAD PAZ y los retos de seguridad para los líderes de control social territorial.",
    "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAKTpwFFyb_YM5NiKZ0Akiby1RiIBc99OUOsAcOzD75pe7FiuTY6iQCrINoRRopGOi04yK4o1KRb677H5MPtIHosvWDQnuAnS_RjKYm6u7LmwCZfrhGphUKHDzShRNA74PSQVMwIKbu0yfF4zXC4z_FS9X6sqJWquuw23okSH_BeA0ZX_SvNB9or_vwc3uuBB8SMkrFATMjbwhzKOBEoFjAvQqWDd4S21eqx-Gnqmfb",
    "category": "Actividades de Representación",
    "date": "12 Feb 2025",
    "order": 2,
    "featured": false
  },
  {
    "id": "publicacion-3",
    "title": "PLUS radica informe de alertas tempranas ante la Procuraduría y Defensoría por obras inconclusas",
    "summary": "El documento alerta sobre un detrimento potencial superior a $14.000 millones en tres proyectos viales que registran suspensión injustificada y falta de interventoría efectiva.",
    "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDhK4A-OhcffnEiZg5CgNqmNi05MeU7sudRmIVrBg_uYYXmbBJWRoVLIwZ7fRaZx1Gc528kU6h03luH0A7HV1bVw-YVcz5TE5dDULAz6PtEY0WRerfkD1mq-8XPBWfeagBC9zLtIx2mnhAD6aGN_Psx7fcFQ96gM9GSXvTTntFOO3LMELkSLD-DEqiUkujmwALK_24m7372HjvQlo8gagQ9hMvDIfmyrF7oVCevdWQM",
    "category": "Alerta Temprana",
    "date": "08 Feb 2025",
    "order": 3,
    "featured": false
  },
  {
    "id": "publicacion-4",
    "title": "Jornada de capacitación a líderes comunales en mecanismos de control social bajo la Ley 850",
    "summary": "Más de 60 delegados de Juntas de Acción Comunal recibieron herramientas prácticas para el acceso a la plataforma SECOP II y redacción de derechos de petición en contratación comunitaria.",
    "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuCyN9nJPHSrxedq3eS9mvY6OPpUcblZ9Xs7ldCPxbNnVmxB1Pl9RtkdrVXcq71xx_w2YBY64VriorU3BEjUInSc_qFBmiDllLFTgeX2avKL8VIMwBr-RapR8r2yfB01pGKniGRs4eV2vctrMAI9aYC0jwmJobhDOdkmYzEDp8zqzYMdKopHjbmHEI00RT4Nh4c8tCnsZVXZH85agfrtwOsYFiJuwjsZCdygmC58rCV6",
    "category": "Formación Ciudadana",
    "date": "04 Feb 2025",
    "order": 4,
    "featured": false
  },
  {
    "id": "publicacion-5",
    "title": "Seguimiento a la restitución de derechos y proyectos productivos en cuencas comunitarias",
    "summary": "Evaluación sobre el cumplimiento de la Sentencia T-622 que reconoce al Río Atrato como sujeto de derechos, revisando desembolsos de proyectos de sustitución de actividades extractivas.",
    "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuCffOmMr7vuZWCPEO_hwLHwN5i7uPTKKQuiPW-UBXUZynIdwA8xqRdrD0NTXxmJ7R1v5Gtf_1qJxfHbuqKUwYNpb76utA4E8wYlbrks4iQr4JYnAYIgj-5inBhpcH7ug77XsSapKko5mdb3hS1YrIIR1B61Pz-XArwsnlWOtYv_sXpUAd-khKzuJMCgo2Nmyvxw24d0d06K8MSWVpFYUxhi8aSfbuibO6LDMZfs94iP",
    "category": "Derechos Colectivos",
    "date": "29 Ene 2025",
    "order": 5,
    "featured": false
  },
  {
    "id": "publicacion-6",
    "title": "Balance de gestión semestral: Más de 34 casos acompañados en el Chocó y Urabá antioqueño",
    "summary": "PLUS publica su matriz semestral de resultados con un 91% de efectividad en mesas de conciliación y la recuperación de cronogramas en 12 centros educativos rurales.",
    "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBEl6xMerP9eISC1BuoLezEM7Je8fOGseyZ4kVzg9OLWg88K0RVHkFE8Hv6wZrPvL0hH3x9eSHdRlH0staEeQpCZKACddDYgmCnKgEBXE41JpABmcAKM4bcbqe9WNk5ORDwJoUtxoyPvAKMLVqNRzv9nR2ZQHFpewxhBE_onV8Lhcgciga1bN-zF_Xxpxi8NyGb_2lNy_4NY8s_UimDcQCV3VyytdRrjfwYbOLVf3hQ",
    "category": "Rendición de Cuentas",
    "date": "24 Ene 2025",
    "order": 6,
    "featured": false
  }
];
