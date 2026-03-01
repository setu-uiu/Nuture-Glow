import React from 'react';
import type { HospitalPlace } from '../../hooks/useNearbyHospitals';

interface HospitalListProps {
  hospitals: HospitalPlace[];
  selectedHospital: HospitalPlace | null;
  onSelectHospital: (hospital: HospitalPlace) => void;
  userLocation: { lat: number; lng: number } | null;
}

const HospitalList: React.FC<HospitalListProps> = ({
  hospitals,
  selectedHospital,
  onSelectHospital,
  userLocation
}) => {
  if (!userLocation) {
    return (
      <div className="p-6 rounded-3xl border border-amber-100 bg-amber-50 text-amber-700 text-sm">
        Enable your location to find nearby hospitals.
      </div>
    );
  }

  if (hospitals.length === 0) {
    return (
      <div className="p-6 rounded-3xl border border-gray-200 bg-white text-gray-500 text-sm">
        No hospitals found. Try increasing the radius.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hospitals.map((hospital) => {
        const selected = selectedHospital?.placeId === hospital.placeId;
        const directionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.lat},${userLocation.lng};${hospital.location.lat},${hospital.location.lng}`;

        return (
          <button
            key={hospital.placeId}
            type="button"
            onClick={() => onSelectHospital(hospital)}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
              selected
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 bg-white hover:border-emerald-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-gray-900">{hospital.name}</h4>
                {hospital.vicinity && (
                  <p className="text-xs text-gray-500 mt-1">{hospital.vicinity}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-600">
                  <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                    {hospital.distanceKm.toFixed(2)} km
                  </span>
                </div>
              </div>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Directions
              </a>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(HospitalList);
