import { useCallback, useMemo, useState } from 'react';

type Location = { lat: number; lng: number };

export type HospitalPlace = {
  placeId: string;
  name: string;
  location: { lat: number; lng: number };
  vicinity?: string;
  distanceKm: number;
};

type UseNearbyHospitalsArgs = {
  location: Location | null;
  radius: number;
};

type UseNearbyHospitalsState = {
  hospitals: HospitalPlace[];
  selectedHospital: HospitalPlace | null;
  loading: boolean;
  error: string | null;
  searchHospitals: () => void;
  selectHospital: (hospital: HospitalPlace) => void;
  clearSelection: () => void;
};

const haversineKm = (a: Location, b: Location) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const c =
    2 *
    Math.atan2(
      Math.sqrt(
        sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon
      ),
      Math.sqrt(1 - (sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon))
    );
  return R * c;
};

const buildQuery = (location: Location, radius: number) => `
[out:json][timeout:25];
(
  node["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
  way["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
  relation["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
);
out center;
`;

const overpassEndpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter'
];

export const useNearbyHospitals = ({ location, radius }: UseNearbyHospitalsArgs): UseNearbyHospitalsState => {
  const [hospitals, setHospitals] = useState<HospitalPlace[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HospitalPlace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchHospitals = useCallback(async () => {
    if (!location) {
      setError('Location not available yet.');
      return;
    }

    setLoading(true);
    setError(null);

    const query = buildQuery(location, radius);
    let response: Response | null = null;
    let data: any = null;

    for (const endpoint of overpassEndpoints) {
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`
        });
        if (!response.ok) {
          continue;
        }
        data = await response.json();
        break;
      } catch (err) {
        // Try next endpoint
      }
    }

    if (!data || !Array.isArray(data.elements)) {
      setHospitals([]);
      setSelectedHospital(null);
      setLoading(false);
      setError('Unable to fetch nearby hospitals. Please try again.');
      return;
    }

    const mapped = data.elements
      .map((element: any) => {
        const lat = element.lat ?? element.center?.lat;
        const lng = element.lon ?? element.center?.lon;
        if (!lat || !lng) return null;

        const tags = element.tags || {};
        const name = tags.name || 'Unnamed Hospital';
        const addressParts = [
          tags['addr:street'],
          tags['addr:suburb'],
          tags['addr:city'],
          tags['addr:state']
        ].filter(Boolean);

        return {
          placeId: `${element.type}-${element.id}`,
          name,
          location: { lat, lng },
          vicinity: addressParts.length ? addressParts.join(', ') : undefined,
          distanceKm: haversineKm(location, { lat, lng })
        } as HospitalPlace;
      })
      .filter(Boolean) as HospitalPlace[];

    mapped.sort((a, b) => a.distanceKm - b.distanceKm);
    const limited = mapped.slice(0, 100);

    setHospitals(limited);
    setSelectedHospital(limited[0] || null);
    setLoading(false);

    if (limited.length === 0) {
      setError('No hospitals found within this radius.');
    }
  }, [location, radius]);

  const selectHospital = useCallback((hospital: HospitalPlace) => {
    setSelectedHospital(hospital);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedHospital(null);
  }, []);

  return useMemo(
    () => ({
      hospitals,
      selectedHospital,
      loading,
      error,
      searchHospitals,
      selectHospital,
      clearSelection
    }),
    [hospitals, selectedHospital, loading, error, searchHospitals, selectHospital, clearSelection]
  );
};
