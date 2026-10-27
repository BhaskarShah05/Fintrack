import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  ArrowRight,
  ShieldCheck, 
  IndianRupee,
  Phone,
  Mail
} from 'lucide-react';
import { Institution, FDRInstrument } from '../types';

interface InstitutionsDirectoryProps {
  institutions: Institution[];
  instruments: FDRInstrument[];
  onSelectInstitutionFDRs: (instCode: string) => void;
}

export const InstitutionsDirectory: React.FC<InstitutionsDirectoryProps> = ({
  institutions,
  instruments,
  onSelectInstitutionFDRs
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');

  const filtered = institutions.filter(inst => {
    if (regionFilter !== 'ALL' && inst.region !== regionFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        inst.name.toLowerCase().includes(q) ||
        inst.code.toLowerCase().includes(q) ||
        inst.city.toLowerCase().includes(q) ||
        inst.state.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatLakhsCr = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  return (
    <div className="space-y-6">
      
      {/* Directory Header Bar */}
      <div className="bg-[#F8F9FA] rounded-[2.5rem] p-6 sm:p-7 border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#CCFF00] text-black">
            Approved Institutes Registry
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight text-black mt-1">
            Institutions Directory
          </h2>
          <p className="text-xs text-gray-600 font-bold mt-0.5">
            Registered technical institutes and regulatory deposit compliance status
          </p>
        </div>

        {/* Search & Region Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by college name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white hover:border-[#0038FF] focus:bg-white border-2 border-gray-200 rounded-full pl-11 pr-4 py-2.5 text-xs font-bold text-black placeholder-gray-400 focus:outline-none focus:border-[#0038FF] focus:ring-4 focus:ring-[#0038FF]/10 transition shadow-xs"
            />
          </div>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-white border-2 border-gray-200 rounded-full px-4 py-2.5 text-xs font-black uppercase text-black hover:border-[#0038FF] focus:ring-2 focus:ring-[#0038FF] focus:outline-none transition cursor-pointer shadow-xs"
          >
            <option value="ALL">All Regions</option>
            <option value="Northern">Northern Region</option>
            <option value="Western">Western Region</option>
            <option value="Southern">Southern Region</option>
            <option value="South-Western">South-Western Region</option>
            <option value="Eastern">Eastern Region</option>
          </select>
        </div>
      </div>

      {/* Colleges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {filtered.map(inst => {
          const collegeFDRs = instruments.filter(i => i.institutionId === inst.id);
          const totalVal = collegeFDRs.reduce((acc, curr) => acc + curr.amount, 0);
          const verifiedCount = collegeFDRs.filter(i => i.workflowStatus === 'VERIFIED').length;

          return (
            <div
              key={inst.id}
              className="bg-[#F8F9FA] border-2 border-gray-200 hover:border-[#0038FF] rounded-[2.5rem] p-7 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-4">
                
                {/* Header: Institution Initials & Region */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0038FF] text-white flex items-center justify-center font-black text-xs shadow-md border border-white/20">
                      {inst.code.slice(0, 3)}
                    </div>
                    <div>
                      <span className="text-xs font-mono font-black text-[#0038FF] block">
                        {inst.code}
                      </span>
                      <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                        {inst.category}
                      </span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-white text-black border border-gray-200 shadow-xs">
                    {inst.region}
                  </span>
                </div>

                {/* College Name */}
                <div>
                  <h3 className="text-base font-black text-black group-hover:text-[#0038FF] transition line-clamp-2 leading-snug">
                    {inst.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-2 font-bold">
                    <MapPin className="w-4 h-4 text-[#0038FF] shrink-0" />
                    <span>{inst.city}, {inst.state}</span>
                  </div>
                </div>

                {/* Contact info pill */}
                <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-200 pt-3 font-semibold">
                  <div className="flex items-center gap-2 text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{inst.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{inst.contactPhone}</span>
                  </div>
                </div>

              </div>

              {/* Deposit Metrics & Action */}
              <div className="mt-6 pt-4 border-t border-gray-200 space-y-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider block">
                      Total Collateral
                    </span>
                    <span className="text-xl font-black text-black">
                      {formatLakhsCr(totalVal)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider block">
                      Active FDRs
                    </span>
                    <span className="text-xs font-black uppercase text-black bg-[#CCFF00] px-3 py-1 rounded-full border border-black/10 inline-flex items-center gap-1.5 shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-black" />
                      <span>{verifiedCount}/{collegeFDRs.length} Verified</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectInstitutionFDRs(inst.code)}
                  className="w-full flex items-center justify-center gap-2 bg-[#0038FF] hover:bg-[#CCFF00] hover:text-black text-white font-black uppercase text-xs py-3 rounded-full transition shadow-md group/btn cursor-pointer"
                >
                  <span>View Registered Deposits</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default InstitutionsDirectory;
