/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'leaflet' {
  interface MapOptions {
    center?: [number, number];
    zoom?: number;
    zoomControl?: boolean;
    [key: string]: any;
  }

  class Map {
    setView(center: [number, number], zoom?: number, options?: Record<string, any>): this;
    remove(): void;
    fitBounds(bounds: any): this;
    [key: string]: any;
  }

  class LayerGroup {
    clearLayers(): this;
    addTo(map: Map): this;
    [key: string]: any;
  }

  class Marker {
    setLatLng(latlng: [number, number]): this;
    addTo(target: Map | LayerGroup): this;
    remove(): this;
    bindPopup(content: string): this;
    openPopup(): this;
    on(event: string, handler: (...args: any[]) => void): this;
    [key: string]: any;
  }

  function map(element: HTMLElement, options?: MapOptions): Map;
  function tileLayer(urlTemplate: string, options?: Record<string, any>): { addTo(map: Map): any };
  function marker(latlng: [number, number], options?: Record<string, any>): Marker;
  function layerGroup(): LayerGroup;
  function circle(latlng: [number, number], options?: Record<string, any>): any;
  function icon(options: Record<string, any>): any;
  function divIcon(options: Record<string, any>): any;
  function latLngBounds(latlngs: [number, number][]): any;
}
