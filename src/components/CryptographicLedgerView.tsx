import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Hash, 
  Link as LinkIcon, 
  Download, 
  Activity,
  Layers,
  Bug
} from 'lucide-react';
import { CryptographicAuditBlock } from '../types';
import { verifyLedgerIntegrity, simpleSha256, computePayloadHash, computeBlockHash } from '../lib/cryptoLedger';
import { getInitialChainedBlocks } from '../data/mockData';
import { api } from '../lib/api';

interface CryptographicLedgerViewProps {
  initialBlocks?: CryptographicAuditBlock[];
}

export const CryptographicLedgerView: React.FC<CryptographicLedgerViewProps> = ({ initialBlocks }) => {
  const [blocks, setBlocks] = useState<CryptographicAuditBlock[]>(initialBlocks || getInitialChainedBlocks());
  const [isTamperedState, setIsTamperedState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const live = await api.getCryptoLedger();
        if (live && live.blocks && live.blocks.length > 0) {
          setBlocks(live.blocks);
        }
      } catch (err) {
        console.warn('Using local crypto ledger cache:', err);
      }
    };
    fetchLedger();
  }, []);

  const verification = verifyLedgerIntegrity(blocks);

  const handleSimulateTampering = async () => {
    if (blocks.length < 3) return;

    try {
      const res = await api.tamperCryptoLedger(2, 'FORGED ENTRY: Manual override of lien clause by unauthorized insider threat.');
      if (res && res.blocks) {
        setBlocks(res.blocks);
        setIsTamperedState(true);
        return;
      }
    } catch (err) {
      console.warn('Backend tamper endpoint unavailable; running local simulation');
    }

    // Local fallback
    const tampered = blocks.map((b, idx) => {
      if (idx === 2) {
        return {
          ...b,
          details: 'FORGED ENTRY: Manual override of lien clause by unauthorized insider threat.',
          isTampered: true
        };
      }
      return b;
    });

    setBlocks(tampered);
    setIsTamperedState(true);
  };

  const handleRestoreIntegrity = async () => {
    try {
      const res = await api.repairCryptoLedger();
      if (res && res.blocks) {
        setBlocks(res.blocks);
        setIsTamperedState(false);
        return;
      }
    } catch (err) {
      console.warn('Backend repair endpoint unavailable; running local reset');
    }

    setBlocks(initialBlocks || getInitialChainedBlocks());
    setIsTamperedState(false);
  };

  const handleExportAuditLedger = () => {
    const jsonStr = JSON.stringify(blocks, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AICTE_KOSH_GUARD_WORM_LEDGER_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-[#F8F9FA] rounded-[2.5rem] p-6 sm:p-7 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0038FF] text-white flex items-center justify-center font-bold shadow-md">
            <Lock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#CCFF00] text-black">
                WORM SHA-256 Engine
              </span>
              <span className="text-[10px] font-mono text-gray-500 font-bold">
                CAP #9 · Slide 5 Immutable Control
              </span>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-black mt-1">
              Cryptographic Hash-Chained Audit Ledger
            </h2>
            <p className="text-xs text-gray-600 font-bold mt-0.5">
              Split DB Privileges · Write-Once-Read-Many (WORM) Block Sealing · Zero Retroactive Erasure
            </p>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isTamperedState ? (
            <button
              type="button"
              onClick={handleRestoreIntegrity}
              className="px-5 py-2.5 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black text-xs font-black uppercase tracking-wider shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Cryptographic Seal</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSimulateTampering}
              className="px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Bug className="w-3.5 h-3.5 text-white" />
              <span>Simulate DB Tamper (Alter Block #2)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportAuditLedger}
            className="px-5 py-2.5 rounded-full bg-white border-2 border-gray-200 text-black hover:bg-black hover:text-[#CCFF00] hover:border-black text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export WORM Log</span>
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      <div className={`p-5 rounded-[2rem] border-2 flex items-start gap-3.5 transition-colors shadow-sm ${
        verification.isValid 
          ? 'bg-[#CCFF00]/20 border-[#CCFF00] text-black' 
          : 'bg-rose-100 border-rose-400 text-rose-950 animate-pulse'
      }`}>
        {verification.isValid ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
        )}
        <div className="text-xs space-y-1">
          <div className="font-black uppercase tracking-wide text-sm">
            {verification.isValid ? 'Cryptographic Chain Validated (100% Sealed)' : 'SECURITY ALARM: Cryptographic Hash Chain Breached!'}
          </div>
          <p className="leading-relaxed font-bold text-gray-800">
            {verification.message}
          </p>
        </div>
      </div>

      {/* Hash-Chained Blockchain Visualizer */}
      <div className="space-y-4">
        {blocks.map((block, idx) => {
          const isBrokenAtOrAfter = !verification.isValid && verification.brokenBlockIndex !== null && idx >= verification.brokenBlockIndex;
          const isDirectlyTampered = block.isTampered;

          return (
            <div 
              key={idx}
              className={`rounded-2xl p-5 border transition-all ${
                isDirectlyTampered 
                  ? 'bg-rose-50 border-rose-400 shadow-md ring-2 ring-rose-500/20' 
                  : isBrokenAtOrAfter
                  ? 'bg-amber-50/60 border-amber-300'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              {/* Block Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                    isDirectlyTampered ? 'bg-rose-600 text-white' :
                    isBrokenAtOrAfter ? 'bg-amber-500 text-white' :
                    'bg-teal-600 text-white'
                  }`}>
                    #{block.blockIndex}
                  </span>
                  <span className="font-heading font-bold text-sm text-slate-900">{block.action}</span>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                    {block.entityId}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{block.actorName} ({block.actorRole})</span>
                  <span>·</span>
                  <span className="font-mono">{block.timestamp}</span>
                </div>
              </div>

              {/* Block Details */}
              <div className="py-3 text-xs text-slate-700 leading-relaxed">
                <span className="font-semibold text-slate-900">Event Payload: </span>
                <span className={isDirectlyTampered ? 'font-bold text-rose-800' : ''}>{block.details}</span>
              </div>

              {/* Cryptographic Hashes Bar */}
              <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-[10px] border-t border-slate-100">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-sans">Previous Hash (Link):</span>
                  <span className="text-slate-600 truncate block">{block.previousHash.slice(0, 24)}...</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-sans">Payload SHA-256:</span>
                  <span className={`truncate block ${isDirectlyTampered ? 'text-rose-700 font-bold' : 'text-slate-600'}`}>
                    {block.payloadHash.slice(0, 24)}...
                  </span>
                </div>
                <div className={`p-2 rounded-xl border ${
                  isDirectlyTampered ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold' :
                  isBrokenAtOrAfter ? 'bg-amber-100 border-amber-300 text-amber-900' :
                  'bg-teal-50 border-teal-200 text-teal-900'
                }`}>
                  <span className="text-slate-400 block font-sans">Block Seal Hash:</span>
                  <span className="truncate block font-bold">{block.blockHash.slice(0, 24)}...</span>
                </div>
              </div>

              {/* Inter-block cryptographic chain link */}
              {idx < blocks.length - 1 && (
                <div className="flex items-center justify-center -mb-9 mt-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border z-10 shadow-xs ${
                    isBrokenAtOrAfter ? 'bg-rose-100 border-rose-400 text-rose-700' : 'bg-white border-slate-300 text-slate-400'
                  }`}>
                    <LinkIcon className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
