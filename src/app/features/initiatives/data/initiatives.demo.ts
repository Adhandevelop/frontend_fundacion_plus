// Local presentation fixtures from the design, not REST contracts.
export interface InitiativeDemo {id:string;slug?:string;title:string;summary:string;description?:string;image:string;imageAlt?:string;category:string;period:string;impact:string;coverage:string;year:string;years?:string[];featured:boolean;gallery?:{id:string;path:string;alt:string;description:string}[];demo?:boolean;}
export const INITIATIVES_DEMO:readonly InitiativeDemo[]=[
  {
    "id": "dulcemania",
    "title": "Dulcemanía: Alegría, Niñez y Escucha Territorial",
    "summary": "Celebración infantil, escucha comunitaria y diagnóstico participativo en barrios y veredas.",
    "image": "https://lh3.googleusercontent.com/aida/AEtjO1XzkATqgB3Hq11KMmzEzZFbRBsv2Mg3xAGdZ-Gf6AsLSYJ4HJuDLvU30ssVsUkvqMF7kLvjtaVdE-xPI_cusz3BrDMhTUrN4Xcht4I4pV8qMWmk8-c0qxdwsFP3eOCZTkel0Nk18mblVP4x-RyV7LCjcz86zhqSSZwACuWX7rEEl3tXDCqKCqCfOl2EzbyWjoETUqlrEmnuiQE9atTT-xS8U6KX6Mv85l4TtYotyW8R",
    "category": "Infancia y Niñez (Dulcemanía)",
    "period": "Octubre de cada año",
    "impact": "Datos de impacto del ejemplo",
    "coverage": "Territorios del diseño",
    "year": "2025",
    "featured": true
  },
  {
    "id": "navidad",
    "title": "Novenas Navideñas y Encuentro Comunitario",
    "summary": "Espacio de balance comunitario de fin de año, compartir de buñuelos tradicionales, villancicos y entrega de obsequios didácticos enfocados en paz barrial.",
    "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBeJ_SdNAHigk0TH_-7UR_vDlxf0c53ntwch3nMsQHWSHtVSRXla_lGTsypSalwelpMaqWNTcrU6PCauGfPk9-72sYW_HiRn-lVumbk35Ikpugrs3C_eL69xgUMhCycavaJBYNI_EgWJJp2YqNP1994FP3yjrIsn5vzzV0NZs4NAoFFUt-KHceAgK1oTfGn2ErZwUx7Jv0izncqCk4yAAiH62mqN99dtoDw0F5ezxaa",
    "category": "Navidad y Novenas Comunitarias",
    "period": "Diciembre",
    "impact": "Beneficiarios: ~1.200 personas",
    "coverage": "12 sectores",
    "year": "2025",
    "featured": false
  },
  {
    "id": "educacion",
    "title": "Jornadas de Útiles y Regreso a Clases con Dignidad",
    "summary": "Entrega de morrales, cuadernos y talleres de lectura infantil para prevenir la deserción escolar temprana en familias con extrema vulnerabilidad económica.",
    "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBfUJXvIFACj38Jfr_I9Y3HTNr1VxxlPYvxplqBKCDZYOg_KbKqy16fZS01-EKtcEpYzqLVFWbe7nnwuUXguIUDE867nlDo4NPMIwvm5XY23RiFFGWPZG5l6m8TE9ud1-PKfENFxwA1CT4hYeNzJVsleRBLSw2EbBN0YMEWXrBfkPrDJ0t2JShy7hrmElSlU72tqUz7dqNTyWN1mZfWfdJ3l4aLEvN7CHNVQsAHddP1",
    "category": "Educación y Regreso a Clases",
    "period": "Enero - Febrero",
    "impact": "Kits entregados: 920 escolares",
    "coverage": "8 veredas",
    "year": "2025",
    "featured": false
  },
  {
    "id": "deporte",
    "title": "Torneos Relámpago y Lúdica para Jóvenes",
    "summary": "Apropiación de escenarios deportivos mediante microfútbol barrial, talleres de mediación comunitaria y diálogo para alejar a la juventud de circuitos de violencia.",
    "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuASjTbf-5JJWB4uirLdYdSOi-MRwGJz_lFLPfOiGrzqc7Wht0uZvMdDuCIwbauPCemSKbgcFJPjL2jYphO8HFogRExB2S2G7TxhMwjcw8MsxJSy69rgQBIbJIKjpbcPRLmWoIkrUoYROiFOwSBLCR4wmGG1_KgUAZkCzRVVUkpqrJW2wddj9HEuisLJB-UbMyrWYyxcTWiOn1Nn_uP9oC1ak2KMjkHcRGki0yCs8WX-",
    "category": "Deporte y Convivencia Juvenil",
    "period": "Junio - Julio",
    "impact": "Jóvenes activos: 640 participantes",
    "coverage": "16 equipos",
    "year": "2025",
    "featured": false
  }
];
