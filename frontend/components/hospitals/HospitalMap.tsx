import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { HospitalPlace } from '../../hooks/useNearbyHospitals';

interface HospitalMapProps {
  userLocation: { lat: number; lng: number } | null;
  hospitals: HospitalPlace[];
  selectedHospital: HospitalPlace | null;
  onSelectHospital: (hospital: HospitalPlace) => void;
  radius: number;
}

const HospitalMap: React.FC<HospitalMapProps> = ({
  userLocation,
  hospitals,
  selectedHospital,
  onSelectHospital,
  radius
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const center = useMemo(() => {
    if (selectedHospital) return [selectedHospital.location.lat, selectedHospital.location.lng] as [number, number];
    if (userLocation) return [userLocation.lat, userLocation.lng] as [number, number];
    return [23.8103, 90.4125] as [number, number];
  }, [selectedHospital, userLocation]);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    leafletRef.current = L.map(mapRef.current, {
      center,
      zoom: 13,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(leafletRef.current);

    markersRef.current = L.layerGroup().addTo(leafletRef.current);
  }, [center]);

  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;

    map.setView(center, 13, { animate: true });
  }, [center]);

  useEffect(() => {
    const map = leafletRef.current;
    if (!map || !markersRef.current) return;

    markersRef.current.clearLayers();

    if (userLocation) {
      const icon = L.icon({
        iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon }).addTo(markersRef.current);
      userMarkerRef.current.bindPopup('You are here').openPopup();
    }

    hospitals.forEach((hospital) => {
      const marker = L.marker([hospital.location.lat, hospital.location.lng]);
      marker.on('click', () => onSelectHospital(hospital));
      const badge = hospital.distanceKm ? `${hospital.distanceKm.toFixed(2)} km` : '';
      marker.bindPopup(`<strong>${hospital.name}</strong><br/>${hospital.vicinity || ''}<br/>${badge}`);
      marker.addTo(markersRef.current!);
    });
  }, [hospitals, userLocation, onSelectHospital]);

  if (!userLocation) {
    return (
      <div className="h-full min-h-[320px] rounded-3xl bg-gray-50 border border-gray-200 flex items-center justify-center text-sm text-gray-500">
        Enable location to load the map.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden h-full min-h-[360px]">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">Nearest Hospital</p>
          <p className="text-sm font-semibold text-gray-900">
            {selectedHospital ? selectedHospital.name : 'Waiting for selection'}
          </p>
        </div>
        <div className="text-xs text-gray-500">Radius {(radius / 1000).toFixed(0)} km</div>
      </div>
      <div ref={mapRef} className="h-[320px]" />
    </div>
  );
};

export default HospitalMap;
