import React from 'react';
import { db } from '../../services/db';

export const KopSurat: React.FC = () => {
  const school = db.getSchool();

  return (
    <div className="border-b-4 border-double border-slate-900 pb-3 mb-6 print:mb-4 text-center">
      <div className="flex items-center justify-between gap-4">
        <div className="w-20 h-20 shrink-0 flex items-center justify-center">
          <img src={school.logoUrl || '/icon.svg'} alt="Logo" className="w-16 h-16 object-contain" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs uppercase font-medium tracking-wider text-slate-700">
            PEMERINTAH DAERAH PROVINSI {school.province?.toUpperCase() || 'JAWA BARAT'}
          </h4>
          <h4 className="text-xs uppercase font-medium tracking-wider text-slate-700">
            DINAS PENDIDIKAN & KEBUDAYAAN
          </h4>
          <h2 className="text-lg md:text-xl font-black uppercase text-slate-900 tracking-wide mt-0.5">
            {school.name}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            NPSN: {school.npsn} | {school.address}, {school.village}, {school.district}, {school.regency} {school.postalCode}
          </p>
          <p className="text-xs text-slate-500">
            Telp: {school.phone} | Email: {school.email} | Web: {school.website}
          </p>
        </div>
        <div className="w-20 shrink-0 hidden sm:block"></div>
      </div>
    </div>
  );
};
