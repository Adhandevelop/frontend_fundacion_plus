import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import type { LatLngExpression, LayerGroup, Map as LeafletMap } from 'leaflet';
import {PublicCaseMapFeature, PublicCaseMapProperties} from '../../map-cases.models';

const VILLAVICENCIO: LatLngExpression = [4.142, -73.6266];
export interface CaseMarkerPresentation {icon:string;color:string;label:string}
const normalize=(value:string)=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function caseMarkerPresentation(value:Pick<PublicCaseMapProperties,'tipo'|'categoria'|'naturaleza'>):CaseMarkerPresentation {
  const text=normalize(`${value.tipo} ${value.categoria} ${value.naturaleza}`);
  if(/agua|acueduct|saneamiento|alcantarill|hidric|rio|quebrada/.test(text))return{icon:'water_drop',color:'#0891b2',label:'Agua y saneamiento'};
  if(/salud|medic|hospital|puesto de salud|nutric/.test(text))return{icon:'medical_services',color:'#dc2626',label:'Salud'};
  if(/educa|escuela|colegio|formacion/.test(text))return{icon:'school',color:'#2563eb',label:'Educación'};
  if(/deporte|parque|recrea/.test(text))return{icon:'sports_soccer',color:'#7c3aed',label:'Deporte y parques'};
  if(/seguridad|violencia|proteccion|riesgo/.test(text))return{icon:'shield',color:'#be123c',label:'Seguridad y protección'};
  if(/infraestructura|vial|puente|via|obra/.test(text))return{icon:'construction',color:'#d97706',label:'Infraestructura'};
  if(/ambiental|ambiente|conservacion/.test(text))return{icon:'eco',color:'#059669',label:'Ambiente'};
  if(/derechos humanos|derecho/.test(text))return{icon:'diversity_3',color:'#4f46e5',label:'Derechos humanos'};
  if(/social|comunitari|familia|cultura/.test(text))return{icon:'groups',color:'#0f766e',label:'Social y comunitario'};
  return{icon:'location_on',color:'#ca8a04',label:'Otro tipo de caso'};
}

@Component({
  selector: 'plus-map-canvas',
  standalone: true,
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class MapCanvasComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly legend:CaseMarkerPresentation[]=[
    {icon:'construction',color:'#d97706',label:'Infraestructura'},
    {icon:'eco',color:'#059669',label:'Ambiente'},
    {icon:'groups',color:'#0f766e',label:'Social'},
    {icon:'medical_services',color:'#dc2626',label:'Salud'},
    {icon:'school',color:'#2563eb',label:'Educación'},
    {icon:'location_on',color:'#ca8a04',label:'Otros'},
  ];
  @Input() mapHeight?: string;
  @Input() features: PublicCaseMapFeature[] = [];
  @Input() selectedCaseId = '';
  @Input() detailContext:'public'|'citizen'|'admin'='public';
  @Output() caseSelected = new EventEmitter<PublicCaseMapFeature>();
  @ViewChild('map', { static: true }) private readonly mapElement!: ElementRef<HTMLDivElement>;
  private map?: LeafletMap;
  private leaflet?: typeof import('leaflet');
  private caseLayer?: LayerGroup;
  private featureRevision = '';
  private resizeObserver?: ResizeObserver;
  status = 'Cargando cartografía de OpenStreetMap…';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['features'] || changes['selectedCaseId']) this.renderCases(!!changes['features']);
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      const leafletModule = await import('leaflet');
      const fallback = (leafletModule as unknown as { default?: typeof import('leaflet') }).default;
      const L = typeof leafletModule.map === 'function' ? leafletModule : fallback;
      if (!this.mapElement.nativeElement.isConnected) return;
      if (!L || typeof L.map !== 'function') throw new Error('Leaflet no expuso su API de mapas.');
      const map = L.map(this.mapElement.nativeElement, {
        center: VILLAVICENCIO,
        zoom: 13,
        minZoom: 6,
        maxZoom: 19,
        zoomControl: true,
        attributionControl: true
      });
      this.map = map;
      this.leaflet = L;
      const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      });
      tiles.on('load', () => this.status = 'Mapa centrado en Villavicencio, Meta.');
      tiles.on('tileerror', () => this.status = 'No fue posible cargar una parte del mapa. Comprueba la conexión e inténtalo nuevamente.');
      tiles.addTo(map);
      this.caseLayer = L.layerGroup().addTo(map);
      this.renderCases(true);

      map.whenReady(() => {
        setTimeout(() => map.invalidateSize(), 0);
        setTimeout(() => map.invalidateSize(), 250);
      });

      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          map.invalidateSize();
        });
        this.resizeObserver.observe(this.mapElement.nativeElement);
      }
    } catch {
      this.status = 'No fue posible iniciar el mapa. Recarga la página; si el problema continúa, informa al equipo técnico.';
    }
  }

  private renderCases(fitResults = false): void {
    const L = this.leaflet;
    const map = this.map;
    const layer = this.caseLayer;
    if (!L || !map || !layer) return;
    layer.clearLayers();
    let selectedMarker:ReturnType<typeof L.marker>|undefined;
    for (const feature of this.features) {
      const [longitude, latitude] = feature.geometry.coordinates;
      const selected = feature.properties.id_caso === this.selectedCaseId;
      const presentation=caseMarkerPresentation(feature.properties);
      const marker = L.marker([latitude, longitude], {icon:L.divIcon({
        className:'plus-case-marker',
        html:`<span class="plus-case-marker__body${selected?' is-selected':''}" style="--case-marker-color:${presentation.color}" title="${presentation.label}"><span class="material-symbols-outlined" aria-hidden="true">${presentation.icon}</span></span>`,
        iconSize:selected?[44,44]:[38,38],iconAnchor:selected?[22,22]:[19,19],popupAnchor:[0,-20],
      })}).addTo(layer);
      marker.bindTooltip(feature.properties.codigo || feature.properties.radicado_code, {
        direction: 'top', offset: [0, -7], className: 'plus-map-label',
      });
      marker.bindPopup(this.popup(feature),{maxWidth:330,minWidth:260,className:'plus-case-popup',offset:[0,-6]});
      marker.on('click', () => {this.caseSelected.emit(feature);map.flyTo([latitude,longitude],16,{animate:true,duration:1});marker.openPopup();this.status=`Caso ${feature.properties.codigo||feature.properties.radicado_code} seleccionado.`;});
      if(selected)selectedMarker=marker;
    }
    const revision=this.features.map(item=>item.properties.id_caso).join('|');
    if(fitResults&&revision!==this.featureRevision&&this.features.length){
      this.featureRevision=revision;
      const points=this.features.map(item=>[item.geometry.coordinates[1],item.geometry.coordinates[0]] as [number,number]);
      if(points.length===1)map.setView(points[0],13,{animate:true});
      else map.fitBounds(points,{padding:[36,36],maxZoom:15,animate:true});
    }
    if(selectedMarker){const feature=this.features.find(item=>item.properties.id_caso===this.selectedCaseId);if(feature){const [longitude,latitude]=feature.geometry.coordinates;map.flyTo([latitude,longitude],16,{animate:true,duration:1});setTimeout(()=>selectedMarker?.openPopup(),350);this.status=`Caso ${feature.properties.codigo||feature.properties.radicado_code} seleccionado.`;return;}}
    this.status = this.features.length
      ? `${this.features.length} ${this.features.length === 1 ? 'caso público ubicado' : 'casos públicos ubicados'} en el mapa.`
      : 'No hay casos públicos con ubicación para los filtros seleccionados.';
  }

  private popup(feature:PublicCaseMapFeature){const value=feature.properties,code=value.codigo||value.radicado_code,prefix=this.detailContext==='admin'?'/admin/casos/':this.detailContext==='citizen'?'/ciudadano/casos-publicos/':'/casos/',href=`${prefix}${encodeURIComponent(code)}`,escape=(text:string)=>String(text??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]!));return `<article class="plus-map-popup-card"><div class="plus-map-popup-status"><span>${escape(value.estado)}</span><strong>${escape(code)}</strong></div><p class="plus-map-popup-place">● ${escape(value.comunidad||value.municipio)}</p><h3>${escape(value.titulo)}</h3><p class="plus-map-popup-meta">${escape(value.tipo)} · ${escape(value.municipio)}, ${escape(value.departamento)}</p><a href="${href}">Ver expediente <span aria-hidden="true">→</span></a></article>`;}

  showVillavicencio(): void {
    this.map?.setView(VILLAVICENCIO, 13, { animate: true });
    this.status = 'Mapa centrado en Villavicencio, Meta.';
  }

  showMeta(): void {
    this.map?.fitBounds([[1.3, -74.95], [4.9, -70.95]], { padding: [24, 24], animate: true });
    this.status = 'Vista general aproximada del departamento del Meta.';
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.caseLayer?.clearLayers();
    this.map?.remove();
    this.map = undefined;
  }
}
