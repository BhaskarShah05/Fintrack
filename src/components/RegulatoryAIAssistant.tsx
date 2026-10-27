import React, { useState } from 'react';
import { 
  Search, 
  X,
  SlidersHorizontal,
  ArrowRight,
  ShieldAlert,
  Clock,
  Landmark,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { FDRInstrument } from '../types';

interface RegulatoryAIAssistantProps {
  instruments: FDRInstrument[];
  onSelectInstrument: (instrument: FDRInstrument) => void;
  onFilterChange: (status: string) => void;
}

export const RegulatoryAIAssistant: React.FC<RegulatoryAIAssistantProps> = ({
  instruments,
  onSelectInstrument,
  onFilterChange
}) => {
  const [query, setQuery] = useState('');
  const [matchedResults, setMatchedResults] = useState<FDRInstrument[]>([]);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null);

  const sampleQueries = [
    { label: 'Expiring < 30 Days', query: 'Maturity within 30 days', icon: Clock },
    { label: 'Deposits ≥ ₹35 Lakhs', query: 'Deposits above ₹35 Lakhs', icon: Landmark },
    { label: 'Lien Discrepancy', query: 'Missing lien clause', icon: ShieldAlert },
    { label: 'State Bank of India', query: 'State Bank of India', icon: Landmark },
    { label: 'Pending Releases', query: 'Pending releases', icon: CheckCircle2 }
  ];

  const handleRunQuery = (qText: string) => {
    setQuery(qText);
    const q = qText.toLowerCase();

    let matches: FDRInstrument[] = [];
    let summary = '';

    if (q.includes('30 day') || q.includes('expir') || q.includes('matur')) {
      matches = instruments.filter(i => {
        const diff = (new Date(i.maturityDate).getTime() - new Date('2026-10-24').getTime()) / (1000 * 3600 * 24);
        return diff <= 30 && diff >= 0;
      });
      summary = `${matches.length} deposit${matches.length === 1 ? '' : 's'} approaching maturity within 30 days`;
    } else if (q.includes('above') || q.includes('35 lakh') || q.includes('30 lakh') || q.includes('≥')) {
      matches = instruments.filter(i => i.amount >= 3500000);
      summary = `${matches.length} instrument${matches.length === 1 ? '' : 's'} with deposit value ≥ ₹35,00,000`;
    } else if (q.includes('discrepancy') || q.includes('missing') || q.includes('lien') || q.includes('deficit')) {
      matches = instruments.filter(i => !i.jointLienAICTE || i.workflowStatus === 'DISCREPANCY_FLAGGED');
      summary = `${matches.length} record${matches.length === 1 ? '' : 's'} flagged for lien deficit or data discrepancy`;
    } else if (q.includes('sbi') || q.includes('state bank')) {
      matches = instruments.filter(i => i.bankName.toLowerCase().includes('state bank') || i.bankName.toLowerCase().includes('sbi'));
      summary = `${matches.length} deposit${matches.length === 1 ? '' : 's'} held with State Bank of India`;
    } else if (q.includes('release') || q.includes('refund') || q.includes('discharge')) {
      matches = instruments.filter(i => i.workflowStatus === 'RELEASE_REQUESTED' || i.workflowStatus === 'RELEASED');
      summary = `${matches.length} instrument${matches.length === 1 ? '' : 's'} in release sanction workflow`;
    } else {
      matches = instruments.filter(i => 
        i.institutionName.toLowerCase().includes(q) || 
        i.bankName.toLowerCase().includes(q) ||
        i.referenceNumber.toLowerCase().includes(q) ||
        i.institutionCode.toLowerCase().includes(q)
      );
      summary = `${matches.length} instrument${matches.length === 1 ? '' : 's'} matching search criteria`;
    }

    setMatchedResults(matches);
    setSummaryMessage(summary);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="rounded-[2.5rem] bg-[#F8F9FA] border border-gray-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0038FF] text-white flex items-center justify-center shrink-0 shadow-md">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#CCFF00] text-black">
                Surveillance Engine
              </span>
              <span className="text-[10px] font-mono text-gray-500 font-bold">
                APH 2026-29 Norms
              </span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-black mt-1">
              Deposit Surveillance & Rapid Query
            </h3>
            <p className="text-xs text-gray-600 font-bold">
              Instantly filter statutory records by institution, scheduled bank, or maturity tenure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-black bg-white border border-gray-200 px-3.5 py-1.5 rounded-full shadow-xs">
            Real-time Ledger Connected
          </span>
        </div>
      </div>

      {/* Search bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); if (query) handleRunQuery(query); }}
        className="relative"
      >
        <Search className="absolute left-5 top-4 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by college name, permanent ID, FDR reference #, or bank..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white border-2 border-gray-200 focus:border-[#0038FF] rounded-full pl-13 pr-32 py-3.5 text-sm font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#0038FF]/10 transition shadow-xs"
        />
        <button
          type="submit"
          className="absolute right-2.5 top-2 bg-[#0038FF] hover:bg-[#002bd6] text-white text-xs font-black uppercase tracking-wider px-6 py-2.5 rounded-full transition shadow-md cursor-pointer hover:scale-105 active:scale-95"
        >
          Query
        </button>
      </form>

      {/* Suggestion pills */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 text-xs">
        <span className="text-gray-500 font-black uppercase text-[10px] tracking-wider shrink-0 mr-1">Quick Scrutiny:</span>
        {sampleQueries.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleRunQuery(item.query)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#CCFF00] text-black hover:border-black text-xs font-bold whitespace-nowrap transition border border-gray-200 shadow-xs cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5 text-[#0038FF]" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Query Results */}
      {summaryMessage && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#0038FF] font-black uppercase tracking-wider flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] border border-black animate-pulse" />
              {summaryMessage}
            </span>
            <button
              onClick={() => { setSummaryMessage(null); setMatchedResults([]); setQuery(''); }}
              className="text-gray-600 hover:text-black px-3 py-1 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>Clear</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {matchedResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchedResults.slice(0, 6).map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelectInstrument(item)}
                  className="p-5 rounded-[2rem] bg-white border border-gray-200 hover:border-[#0038FF] hover:shadow-xl cursor-pointer transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center text-xs pb-3 border-b border-gray-100">
                      <span className="font-mono text-[#0038FF] text-xs font-black">{item.referenceNumber}</span>
                      <span className="text-[11px] text-gray-700 font-bold">{item.bankName}</span>
                    </div>
                    <p className="text-sm font-black text-black mt-3 line-clamp-1 group-hover:text-[#0038FF] transition-colors">
                      {item.institutionName}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-black block tracking-wider">Deposit</span>
                      <span className="font-black text-base text-black">{formatCurrency(item.amount)}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSelectInstrument(item); }}
                      className="px-4 py-1.5 bg-[#0038FF] hover:bg-[#CCFF00] hover:text-black text-white text-[11px] font-black uppercase rounded-full flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 font-bold italic">No instruments matched the specified query parameters.</p>
          )}
        </div>
      )}

    </div>
  );
};

export default RegulatoryAIAssistant;
