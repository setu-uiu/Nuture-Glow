import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, RefreshCw, LocateFixed } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useNearbyHospitals } from '../../hooks/useNearbyHospitals';
import HospitalMap from './HospitalMap';
import HospitalList from './HospitalList';

const radiusOptions = [
  { label: '1 km', value: 1000 },
  { label: '3 km', value: 3000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 }
];

const HospitalFinder: React.FC = () => {
  const [radius, setRadius] = useState(5000);
  const { location, loading: locating, error: locationError, getLocation } = useGeolocation();
  const {
    hospitals,
    selectedHospital,
    loading,
    error,
    searchHospitals,
    selectHospital
  } = useNearbyHospitals({ location, radius });

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    if (location) {
      searchHospitals();
    }
  }, [location, radius, searchHospitals]);

  const statusMessage = useMemo(() => {
    if (locationError) return locationError;
    if (error) return error;
    if (!location) return 'Allow location access to show nearby hospitals.';
    if (loading) return 'Searching nearby hospitals...';
    return null;
  }, [locationError, error, location, loading]);

  return (
    <div className="bg-white/80 rounded-[32px] border border-gray-200 shadow-sm p-4 md:p-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nearby Hospitals</h2>
          <p className="text-sm text-gray-600">Live results based on your current location.</p>
          {location && (
            <p className="text-xs text-emerald-700 mt-1">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={getLocation}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2"
          >
            <LocateFixed size={14} />
            Update Location
          </button>
          <button
            type="button"
            onClick={searchHospitals}
            disabled={!location || loading}
            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <div className="relative">
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
            >
              {radiusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="px-4 py-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-sm flex items-center gap-2">
          <MapPin size={16} />
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 min-h-[360px]">
          <HospitalMap
            userLocation={location}
            hospitals={hospitals}
            selectedHospital={selectedHospital}
            onSelectHospital={selectHospital}
            radius={radius}
          />
        </div>
        <div className="lg:col-span-5">
          <HospitalList
            hospitals={hospitals}
            selectedHospital={selectedHospital}
            onSelectHospital={selectHospital}
            userLocation={location}
          />
        </div>
      </div>

      {locating && (
        <div className="text-xs text-gray-500">Fetching your current location...</div>
      )}
    </div>
  );
};

export default HospitalFinder;
