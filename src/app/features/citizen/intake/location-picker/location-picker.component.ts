import {AfterViewInit,Component,ElementRef,EventEmitter,Input,OnChanges,OnDestroy,Output,SimpleChanges,ViewChild} from '@angular/core';
import type {Map as LeafletMap,Marker} from 'leaflet';

const VILLAVICENCIO:[number,number]=[4.142,-73.6266];

@Component({selector:'plus-intake-location-picker',standalone:true,templateUrl:'./location-picker.component.html',styleUrl:'./location-picker.component.css'})
export class LocationPickerComponent implements AfterViewInit,OnChanges,OnDestroy{
 @Input() latitude:number|null=null;@Input() longitude:number|null=null;
 @Output() locationSelected=new EventEmitter<{latitude:number;longitude:number}|null>();
 @ViewChild('map',{static:true})private readonly element!:ElementRef<HTMLDivElement>;
 private map?:LeafletMap;private marker?:Marker;private leaflet?:typeof import('leaflet');private resize?:ResizeObserver;
 status='Cargando el mapa para seleccionar la ubicación…';
 async ngAfterViewInit(){try{const module=await import('leaflet'),fallback=(module as unknown as {default?:typeof import('leaflet')}).default,L=typeof module.map==='function'?module:fallback;if(!L||!this.element.nativeElement.isConnected)throw new Error();this.leaflet=L;this.map=L.map(this.element.nativeElement,{center:this.valid()? [this.latitude!,this.longitude!]:VILLAVICENCIO,zoom:this.valid()?16:13,minZoom:6,maxZoom:19});L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'}).addTo(this.map);this.map.on('click',event=>this.choose(event.latlng.lat,event.latlng.lng,true));this.render();this.status=this.valid()?'Ubicación restaurada. Haz clic en el mapa para cambiarla.':'Haz clic en el mapa en el lugar aproximado del caso.';this.map.whenReady(()=>setTimeout(()=>this.map?.invalidateSize(),0));if(typeof ResizeObserver!=='undefined'){this.resize=new ResizeObserver(()=>this.map?.invalidateSize());this.resize.observe(this.element.nativeElement);}}catch{this.status='No fue posible iniciar el mapa. Recarga la página e inténtalo nuevamente.';}}
 ngOnChanges(changes:SimpleChanges){if(changes['latitude']||changes['longitude'])this.render();}
 private valid(){return this.latitude!==null&&this.longitude!==null&&this.latitude>=-90&&this.latitude<=90&&this.longitude>=-180&&this.longitude<=180;}
 private render(){if(!this.map||!this.leaflet)return;if(!this.valid()){this.marker?.remove();this.marker=undefined;return;}const point=this.leaflet.latLng(this.latitude!,this.longitude!);if(this.marker)this.marker.setLatLng(point);else this.marker=this.leaflet.marker(point,{draggable:true}).addTo(this.map).on('dragend',event=>{const location=(event.target as Marker).getLatLng();this.choose(location.lat,location.lng,false);});}
 private choose(latitude:number,longitude:number,center:boolean){this.latitude=Number(latitude.toFixed(6));this.longitude=Number(longitude.toFixed(6));this.render();if(center)this.map?.panTo([this.latitude,this.longitude]);this.status='Ubicación seleccionada. Puedes mover el marcador o hacer clic en otro punto.';this.locationSelected.emit({latitude:this.latitude,longitude:this.longitude});}
 locate(){if(!navigator.geolocation){this.status='Este navegador no permite consultar la ubicación del dispositivo.';return;}this.status='Solicitando ubicación al dispositivo…';navigator.geolocation.getCurrentPosition(position=>{this.choose(position.coords.latitude,position.coords.longitude,true);this.map?.setZoom(17);},()=>this.status='No se pudo obtener la ubicación. Puedes marcar el punto manualmente.',{enableHighAccuracy:true,timeout:10000,maximumAge:60000});}
 clear(){this.latitude=null;this.longitude=null;this.render();this.status='Ubicación eliminada. Puedes seleccionar otro punto.';this.locationSelected.emit(null);}
 showMeta(){this.map?.fitBounds([[1.3,-74.95],[4.9,-70.95]],{padding:[20,20]});this.status='Vista general del Meta. Acércate y marca el lugar aproximado.';}
 ngOnDestroy(){this.resize?.disconnect();this.map?.remove();this.map=undefined;}
}
