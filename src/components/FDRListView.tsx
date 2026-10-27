import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Eye, 
  RefreshCw, 
  Landmark, 
  Search,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  Table as TableIcon,
  Layers
} from 'lucide-react';
import { FDRInstrument, InstrumentStatus, UserRole } from '../types';

interface FDRListViewProps {
  instruments: FDRInstrument[];
  currentRole: UserRole;
  selectedFilter: string;
  onFilterChange: (status: string) => void;
  onSelectInstrument: (instrument: FDRInstrument) => void;
  onOpenRenewalModal: (instrument: FDRInstrument) => void;
  onOpenReleaseModal: (instrument: FDRInstrument) => void;
  onOpenVerificationModal: (instrument: FDRInstrument) => void;
  onOpenDualTruthModal?: (instrument: FDRInstrument) => void;
  onOpenForensicsModal?: (instrument: FDRInstrument) => void;
  onOpenBankPortalModal?: (instrument: FDRInstrument) => void;
}

export const FDRListView: React.FC<FDRListViewProps> = ({
  instruments,
  currentRole,
  selectedFilter,
  onFilterChange,
  onSelectInstrument,
  onOpenRenewalModal,
  onOpenReleaseModal,
  onOpenVerificationModal,
  onOpenDualTruthModal,
  onOpenForensicsModal,
  onOpenBankPortalModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter instruments based on status, search, and bank
  const filteredInstruments = instruments.filter(item => {
    // Status filter
    if (selectedFilter !== 'ALL' && item.workflowStatus !== selectedFilter) {
      return false;
    }

    // Bank filter
    if (selectedBank !== 'ALL' && !item.bankName.toLowerCase().includes(selectedBank.toLowerCase())) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchInst = item.institutionName.toLowerCase().includes(q);
      const matchCode = item.institutionCode.toLowerCase().includes(q);
      const matchRef = item.referenceNumber.toLowerCase().includes(q);
      const matchBank = item.bankName.toLowerCase().includes(q);
      const matchPurpose = item.purpose.toLowerCase().includes(q);
      return matchInst || matchCode || matchRef || matchBank || matchPurpose;
    }

    return true;
  });

  const getStatusBadge = (status: InstrumentStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase bg-[#CCFF00] text-black border border-black/10 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-black" />
            <span>Verified & Lien Active</span>
          </span>
        );
      case 'RENEWAL_DUE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase bg-amber-400 text-black border border-black/10 shadow-xs animate-pulse">
            <Clock className="w-3.5 h-3.5 text-black" />
            <span>Renewal Due (&lt;30d)</span>
          </span>
        );
      case 'DISCREPANCY_FLAGGED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase bg-rose-500 text-white shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span>Discrepancy</span>
          </span>
        );
      case 'SUBMITTED':
      case 'UNDER_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase bg-[#0038FF] text-white shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Under Review</span>
          </span>
        );
      case 'RELEASE_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase bg-purple-600 text-white shadow-xs">
            <Landmark className="w-3.5 h-3.5 text-white" />
            <span>Release Requested</span>
          </span>
        );
      case 'RELEASED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase bg-gray-200 text-black shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-black" />
            <span>Released</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-gray-100 text-black border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getDaysRemaining = (maturityDateStr: string) => {
    const today = new Date('2026-10-24');
    const maturity = new Date(maturityDateStr);
    const diffTime = maturity.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const exportCSV = () => {
    const headers = [
      'Reference Number',
      'Institution Name',
      'Institution Code',
      'Bank Name',
      'Branch',
      'Amount (INR)',
      'Issue Date',
      'Maturity Date',
      'Workflow Status',
      'Joint Lien AICTE'
    ];

    const rows = filteredInstruments.map(i => [
      `"${i.referenceNumber}"`,
      `"${i.institutionName}"`,
      `"${i.institutionCode}"`,
      `"${i.bankName}"`,
      `"${i.branchName}"`,
      i.amount,
      i.issueDate,
      i.maturityDate,
      i.workflowStatus,
      i.jointLienAICTE ? 'YES' : 'NO'
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FinTrack_Deposits_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Toolbar */}
      <div className="bg-[#F8F9FA] rounded-[2.5rem] p-6 sm:p-7 border border-gray-200 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-5 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by college, FDR #, bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white hover:border-[#0038FF] focus:bg-white border-2 border-gray-200 rounded-full pl-12 pr-14 py-2.5 text-sm font-bold text-black placeholder-gray-400 focus:outline-none focus:border-[#0038FF] focus:ring-4 focus:ring-[#0038FF]/10 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3 text-xs text-gray-400 hover:text-black font-black cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Status Dropdown */}
            <select
              value={selectedFilter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="bg-white border-2 border-gray-200 rounded-full px-4 py-2.5 text-xs font-black uppercase text-black hover:border-[#0038FF] focus:ring-2 focus:ring-[#0038FF] focus:outline-none transition cursor-pointer shadow-xs"
            >
              <option value="ALL">All Statuses ({instruments.length})</option>
              <option value="VERIFIED">Verified & Lien Active</option>
              <option value="RENEWAL_DUE">Renewal Due (&lt;30d)</option>
              <option value="DISCREPANCY_FLAGGED">Discrepancy Flagged</option>
              <option value="SUBMITTED">Pending Review</option>
              <option value="RELEASE_REQUESTED">Release Requested</option>
            </select>

            {/* Bank Filter */}
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="bg-white border-2 border-gray-200 rounded-full px-4 py-2.5 text-xs font-black uppercase text-black hover:border-[#0038FF] focus:ring-2 focus:ring-[#0038FF] focus:outline-none transition cursor-pointer shadow-xs"
            >
              <option value="ALL">All Banks</option>
              <option value="SBI">State Bank of India</option>
              <option value="Punjab">Punjab National Bank</option>
              <option value="Canara">Canara Bank</option>
              <option value="Baroda">Bank of Baroda</option>
              <option value="HDFC">HDFC Bank</option>
            </select>

            {/* Export CSV */}
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-5 py-2.5 border-2 border-gray-200 bg-white hover:bg-[#CCFF00] hover:text-black hover:border-black text-xs font-black uppercase text-black rounded-full transition shadow-xs cursor-pointer"
              title="Export registry to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-gray-200 p-1 rounded-full border border-gray-300">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-full transition cursor-pointer ${viewMode === 'cards' ? 'bg-[#0038FF] text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-full transition cursor-pointer ${viewMode === 'table' ? 'bg-[#0038FF] text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Status count pills summary row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs pt-2 border-t border-gray-200">
          <span className="text-gray-500 font-black uppercase text-[10px] tracking-wider shrink-0 mr-1">Quick Filter:</span>
          {[
            { id: 'ALL', label: 'All Records', count: instruments.length },
            { id: 'VERIFIED', label: 'Active Liens', count: instruments.filter(i => i.workflowStatus === 'VERIFIED').length },
            { id: 'RENEWAL_DUE', label: 'Renewal Due', count: instruments.filter(i => i.workflowStatus === 'RENEWAL_DUE').length },
            { id: 'DISCREPANCY_FLAGGED', label: 'Discrepancies', count: instruments.filter(i => i.workflowStatus === 'DISCREPANCY_FLAGGED').length },
            { id: 'SUBMITTED', label: 'Under Review', count: instruments.filter(i => i.workflowStatus === 'SUBMITTED' || i.workflowStatus === 'UNDER_VERIFICATION').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase whitespace-nowrap transition cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-[#0038FF] text-white shadow-md'
                  : 'bg-white hover:bg-gray-100 text-black border border-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono ${selectedFilter === tab.id ? 'bg-[#CCFF00] text-black font-black' : 'bg-gray-100 text-gray-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* Empty State */}
      {filteredInstruments.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-heading font-bold text-slate-900">No Instruments Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            No fixed deposit records match your active search or filter criteria. Clear your filters to view all records.
          </p>
          <button
            onClick={() => { setSearchQuery(''); onFilterChange('ALL'); setSelectedBank('ALL'); }}
            className="pill-btn px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* CARD GRID VIEW MODE */}
      {viewMode === 'cards' && filteredInstruments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredInstruments.map((item) => {
            const daysLeft = getDaysRemaining(item.maturityDate);
            const isExpiringSoon = daysLeft <= 30 && daysLeft >= 0;
            const isAlreadyMatured = daysLeft < 0;

            return (
              <div
                key={item.id}
                className="rounded-[2.5rem] p-7 flex flex-col justify-between group transition-all duration-300 relative bg-[#F8F9FA] border-2 border-gray-200 hover:border-[#0038FF] hover:shadow-2xl overflow-hidden"
              >
                {/* Accent Top Strip */}
                <div className={`absolute top-0 inset-x-0 h-2 pointer-events-none ${
                  item.workflowStatus === 'VERIFIED' ? 'bg-[#CCFF00]' :
                  item.workflowStatus === 'RENEWAL_DUE' ? 'bg-amber-400' :
                  item.workflowStatus === 'DISCREPANCY_FLAGGED' ? 'bg-rose-500' : 'bg-[#0038FF]'
                }`} />

                <div>
                  {/* Bank & Reference Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#0038FF] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md border border-white/20">
                        {item.bankName.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase text-black block">{item.bankName}</span>
                        <span className="text-[11px] text-gray-500 font-mono font-bold tracking-tight">{item.referenceNumber}</span>
                      </div>
                    </div>

                    {item.jointLienAICTE && (
                      <span className="p-2 rounded-2xl bg-[#CCFF00] text-black border border-black/10 shadow-xs" title="Joint Lien Endorsement in favor of AICTE">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="mt-2">
                    {getStatusBadge(item.workflowStatus)}
                  </div>

                  {/* Institution Details */}
                  <div className="pt-3">
                    <p className="text-base font-black text-black leading-snug line-clamp-2 group-hover:text-[#0038FF] transition-colors">
                      {item.institutionName}
                    </p>
                  </div>

                  {/* Purpose Tag */}
                  <div className="inline-block px-3.5 py-1 rounded-full bg-white border border-gray-200 text-black text-xs font-bold mt-2.5 shadow-xs">
                    {item.purpose}
                  </div>
                </div>

                {/* Amount & Maturity Details */}
                <div className="mt-6 pt-5 border-t border-gray-200 space-y-3.5">
                  
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] text-gray-500 font-black uppercase tracking-wider">Deposit Value</span>
                    <span className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>

                  {/* Maturity Countdown Ribbon */}
                  <div className={`p-3.5 rounded-2xl border-2 text-xs flex items-center justify-between font-bold ${
                    isExpiringSoon 
                      ? 'bg-amber-100 border-amber-400 text-black' 
                      : isAlreadyMatured 
                      ? 'bg-rose-100 border-rose-400 text-rose-900'
                      : 'bg-white border-gray-200 text-black'
                  }`}>
                    <div>
                      <span className="text-[10px] uppercase font-black text-gray-500 block tracking-wider">
                        Maturity
                      </span>
                      <span className="font-black text-black">{item.maturityDate}</span>
                    </div>

                    <div className="text-right">
                      {isAlreadyMatured ? (
                        <span className="font-black text-rose-700">Matured ({Math.abs(daysLeft)}d ago)</span>
                      ) : isExpiringSoon ? (
                        <span className="font-black text-amber-900 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{daysLeft} Days Left</span>
                        </span>
                      ) : (
                        <span className="font-bold text-gray-600">{daysLeft} Days Left</span>
                      )}
                    </div>
                  </div>

                  {/* Discrepancy indicator note if present */}
                  {item.extractedData?.discrepancies && item.extractedData.discrepancies.length > 0 && (
                    <div className="p-3 rounded-2xl bg-rose-100 border-2 border-rose-300 text-xs text-rose-900 flex items-start gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{item.extractedData.discrepancies[0]}</span>
                    </div>
                  )}

                  {/* KOSH-GUARD Verification Workbenches Strip */}
                  <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                    {onOpenDualTruthModal && (
                      <button
                        onClick={() => onOpenDualTruthModal(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-black uppercase bg-white hover:bg-[#CCFF00] hover:text-black text-black border border-gray-200 transition cursor-pointer shadow-xs"
                        title="Open Dual-Truth Reconciliation Workbench (Institution Claim vs Bank Fact)"
                      >
                        <Layers className="w-3 h-3 text-[#0038FF]" />
                        <span>Dual-Truth</span>
                        {item.dualTruth && (!item.dualTruth.amountMatch || !item.dualTruth.fdrNoMatch || item.dualTruth.reconciliationState === 'DISCREPANCY') && (
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                        )}
                      </button>
                    )}
                    {onOpenForensicsModal && (
                      <button
                        onClick={() => onOpenForensicsModal(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-black uppercase bg-white hover:bg-[#CCFF00] hover:text-black text-black border border-gray-200 transition cursor-pointer shadow-xs"
                        title="Open PaddleOCR & OpenCV ELA Forensics"
                      >
                        <Sparkles className="w-3 h-3 text-[#0038FF]" />
                        <span>Forensics/ELA</span>
                        {item.elaAnalysis?.elaIndicator === 'PROBABLE_ALTERATION' && (
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                        )}
                      </button>
                    )}
                    {onOpenBankPortalModal && (
                      <button
                        onClick={() => onOpenBankPortalModal(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-black uppercase bg-white hover:bg-[#CCFF00] hover:text-black text-black border border-gray-200 transition cursor-pointer shadow-xs"
                        title="Open Hybrid Bank Verification Portal (NeSL e-BG / Nodal Attestation)"
                      >
                        <Landmark className="w-3 h-3 text-[#0038FF]" />
                        <span>Bank Portal</span>
                      </button>
                    )}
                  </div>

                  {/* Action Buttons with Neobrutalist Pill Styling */}
                  <div className="pt-2 flex items-center gap-2">
                    
                    {/* View Details / Inspect */}
                    <button
                      onClick={() => onSelectInstrument(item)}
                      className="flex-1 gap-1.5 bg-white hover:bg-black hover:text-[#CCFF00] text-black border-2 border-gray-200 text-xs py-2.5 rounded-full font-black uppercase flex items-center justify-center transition shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    {/* Official Review (For AICTE Official / Scrutiny Roles) */}
                    {currentRole !== 'INSTITUTION' && (
                      <button
                        onClick={() => onOpenVerificationModal(item)}
                        className="flex-1 gap-1.5 bg-[#0038FF] hover:bg-[#002bd6] text-white text-xs py-2.5 rounded-full font-black uppercase flex items-center justify-center transition shadow-md cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Scrutiny</span>
                      </button>
                    )}

                    {/* Renewal Action if due */}
                    {item.workflowStatus === 'RENEWAL_DUE' && (
                      <button
                        onClick={() => onOpenRenewalModal(item)}
                        className="flex-1 gap-1.5 bg-amber-400 hover:bg-amber-500 text-black border border-black/20 text-xs py-2.5 rounded-full font-black uppercase flex items-center justify-center shadow-md cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Renew</span>
                      </button>
                    )}

                    {/* Release Action if matured or eligible */}
                    {(isAlreadyMatured || item.tenureYears >= 8) && item.workflowStatus !== 'RELEASE_REQUESTED' && item.workflowStatus !== 'RELEASED' && (
                      <button
                        onClick={() => onOpenReleaseModal(item)}
                        className="flex-1 gap-1.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black border border-black text-xs py-2.5 rounded-full font-black uppercase flex items-center justify-center shadow-md cursor-pointer"
                      >
                        <Landmark className="w-3.5 h-3.5" />
                        <span>Release</span>
                      </button>
                    )}

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW MODE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Instrument / FDR #</th>
                  <th className="py-4 px-6">Institution</th>
                  <th className="py-4 px-6">Bank & Branch</th>
                  <th className="py-4 px-6">Principal Amount</th>
                  <th className="py-4 px-6">Maturity Date</th>
                  <th className="py-4 px-6">Lien Clause</th>
                  <th className="py-4 px-6">Workflow Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInstruments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 font-mono">{item.referenceNumber}</div>
                      <span className="text-[11px] text-slate-500">{item.purpose}</span>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{item.institutionName}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{item.bankName}</div>
                      <span className="text-[11px] text-slate-500">{item.branchName}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-teal-700 font-heading">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {item.maturityDate}
                    </td>
                    <td className="py-4 px-6">
                      {item.jointLienAICTE ? (
                        <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                          JOINT LIEN
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
                          MISSING
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(item.workflowStatus)}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                      {onOpenDualTruthModal && (
                        <button
                          onClick={() => onOpenDualTruthModal(item)}
                          className="pill-btn px-2.5 py-1 text-[11px] bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 font-semibold shadow-xs cursor-pointer"
                          title="Dual-Truth Reconciliation"
                        >
                          Dual-Truth
                        </button>
                      )}
                      {onOpenForensicsModal && (
                        <button
                          onClick={() => onOpenForensicsModal(item)}
                          className="pill-btn px-2.5 py-1 text-[11px] bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 font-semibold shadow-xs cursor-pointer"
                          title="PaddleOCR & ELA Forensics"
                        >
                          Forensics
                        </button>
                      )}
                      <button
                        onClick={() => onSelectInstrument(item)}
                        className="pill-btn px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold shadow-xs cursor-pointer"
                      >
                        View
                      </button>
                      {currentRole !== 'INSTITUTION' && (
                        <button
                          onClick={() => onOpenVerificationModal(item)}
                          className="pill-btn px-3.5 py-1.5 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white font-bold transition border border-teal-200 hover:border-transparent shadow-xs cursor-pointer"
                        >
                          Scrutiny
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default FDRListView;
