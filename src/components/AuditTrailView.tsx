import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Lock, 
  Calendar,
  Clock,
  User,
  Activity
} from 'lucide-react';
import { AuditLog } from '../types';

interface AuditTrailViewProps {
  logs: AuditLog[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs }) => {
  const [filterRole, setFilterRole] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(log => {
    if (filterRole !== 'ALL' && log.actorRole !== filterRole) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-[#F8F9FA] rounded-[2.5rem] p-6 sm:p-7 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0038FF] text-white flex items-center justify-center font-bold shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#CCFF00] text-black">
              WORM Compliant
            </span>
            <h2 className="text-2xl font-black uppercase tracking-tight text-black mt-1">
              Audit Trail & Compliance Log
            </h2>
            <p className="text-xs text-gray-600 font-bold mt-0.5">
              Immutable chronological record of regulatory actions, verifications, and approvals
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-white border-2 border-gray-200 rounded-full px-4 py-2.5 text-xs font-black uppercase text-black hover:border-[#0038FF] focus:ring-2 focus:ring-[#0038FF] focus:outline-none transition cursor-pointer shadow-xs"
          >
            <option value="ALL">All Roles</option>
            <option value="INSTITUTION">Institution User</option>
            <option value="OFFICIAL">AICTE Official</option>
            <option value="SUPERVISOR">Supervisor</option>
          </select>

          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search action logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white hover:border-[#0038FF] focus:bg-white border-2 border-gray-200 rounded-full pl-10 pr-4 py-2.5 text-xs font-bold text-black placeholder-gray-400 focus:outline-none focus:border-[#0038FF] focus:ring-4 focus:ring-[#0038FF]/10 transition w-56 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="bg-[#F8F9FA] rounded-[2.5rem] p-7 border-2 border-gray-200 shadow-sm divide-y divide-gray-200">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm font-bold">
            No audit records match the selected filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            return (
              <div key={log.id} className="py-5 first:pt-0 last:pb-0 flex items-start gap-4">
                
                {/* Timeline icon */}
                <div className="w-10 h-10 rounded-2xl bg-[#0038FF] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Activity className="w-5 h-5" />
                </div>

                {/* Log Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-black">{log.actorName}</span>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        log.actorRole === 'INSTITUTION' 
                          ? 'bg-[#CCFF00] text-black border-black/10' 
                          : log.actorRole === 'OFFICIAL'
                          ? 'bg-[#0038FF] text-white border-transparent'
                          : 'bg-purple-600 text-white border-transparent'
                      }`}>
                        {log.actorRole}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-black bg-white px-2.5 py-0.5 rounded-lg border border-gray-200 shadow-xs">
                        {log.action}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono font-bold">
                      <span>{log.timestamp}</span>
                      <span>•</span>
                      <span className="text-gray-400">{log.ipAddress}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-bold">
                    {log.details}
                  </p>

                  {/* Previous / New state diff if present */}
                  {(log.previousValue || log.newValue) && (
                    <div className="mt-2 text-[11px] font-mono bg-white p-3 rounded-2xl border border-gray-200 flex items-center gap-3 text-black font-bold shadow-xs">
                      {log.previousValue && (
                        <span><span className="text-rose-600 font-black">PREV:</span> {log.previousValue}</span>
                      )}
                      {log.previousValue && log.newValue && <span className="text-gray-400">→</span>}
                      {log.newValue && (
                        <span><span className="text-emerald-700 font-black">NEW:</span> {log.newValue}</span>
                      )}
                    </div>
                  )}

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default AuditTrailView;
