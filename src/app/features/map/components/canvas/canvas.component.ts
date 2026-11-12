import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import type { LatLngExpression, Map as LeafletMap } from 'leaflet';

const VILLAVICENCIO: LatLngExpression = [4.142, -73.6266];

@Component({
  selector: 'plus-map-canvas',
  standalone: true,
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class MapCanvasComponent implements AfterViewInit, OnDestroy {
  @Input() mapHeight?: string;
  @ViewChild('map', { static: true }) private readonly mapElement!: ElementRef<HTMLDivElement>;
  private map?: LeafletMap;
  private resizeObserver?: ResizeObserver;
  status = 'Cargando cartografía de OpenStreetMap…';

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
      const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      });
      tiles.on('load', () => this.status = 'Mapa centrado en Villavicencio, Meta.');
      tiles.on('tileerror', () => this.status = 'No fue posible cargar una parte del mapa. Comprueba la conexión e inténtalo nuevamente.');
      tiles.addTo(map);
      L.circleMarker(VILLAVICENCIO, { radius: 9, color: '#0f172a', weight: 3, fillColor: '#facc15', fillOpacity: 1 })
        .addTo(map)
        .bindTooltip('Villavicencio · Meta', { permanent: true, direction: 'top', offset: [0, -8], className: 'plus-map-label' });

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
    this.map?.remove();
    this.map = undefined;
  }
}
