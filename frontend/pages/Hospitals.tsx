import React from 'react';
import HospitalFinder from '../components/hospitals/HospitalFinder';

const Hospitals: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F5EF]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <HospitalFinder />
      </div>
    </div>
  );
};

export default Hospitals;
