import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Landmark, 
  Search,
  Plus,
  ArrowRight,
  Server,
  HardDrive,
  Laptop
} from 'lucide-react';

import { 
  UserRole, 
  FDRInstrument, 
  Institution, 
  AuditLog, 
  NotificationItem 
} from './types';

import { 
  INITIAL_INSTITUTIONS, 
  INITIAL_INSTRUMENTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS 
} from './data/mockData';
import { api } from './lib/api';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DashboardStats } from './components/DashboardStats';
import { FDRListView } from './components/FDRListView';
import { FDRRegistrationModal } from './components/FDRRegistrationModal';
import { VerificationDrawer } from './components/VerificationDrawer';
import { RenewalWorkflowModal } from './components/RenewalWorkflowModal';
import { ReleaseWorkflowModal } from './components/ReleaseWorkflowModal';
import { InstrumentDetailModal } from './components/InstrumentDetailModal';
import { RegulatoryAIAssistant } from './components/RegulatoryAIAssistant';
import { RegulatoryLifecycleGuide } from './components/RegulatoryLifecycleGuide';
import { InstitutionsDirectory } from './components/InstitutionsDirectory';
import { AuditTrailView } from './components/AuditTrailView';
import { DualTruthReconciliationWorkbench } from './components/DualTruthReconciliationWorkbench';
import { BankVerificationPortalModal } from './components/BankVerificationPortalModal';
import { ForensicsWorkbenchModal } from './components/ForensicsWorkbenchModal';
import { CryptographicLedgerView } from './components/CryptographicLedgerView';
import { ExecutiveReportsView } from './components/ExecutiveReportsView';
import { InteractiveScenariosBar } from './components/InteractiveScenariosBar';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  // Global State
  const [currentRole, setCurrentRole] = useState<UserRole>('OFFICIAL');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [instruments, setInstruments] = useState<FDRInstrument[]>(INITIAL_INSTRUMENTS);
  const [institutions, setInstitutions] = useState<Institution[]>(INITIAL_INSTITUTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  // Backend connection state
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [backendMetrics, setBackendMetrics] = useState<{ instrumentsCount: number; uploadsCount: number; wormBlocksCount: number } | null>(null);

  // Load live data from backend
  useEffect(() => {
    let isMounted = true;
    const loadBackendData = async () => {
      try {
        const health = await api.getHealth();
        if (!isMounted) return;
        setBackendStatus('connected');
        setBackendMetrics(health.metrics);

        const [insts, instsList, logs, notifs] = await Promise.allSettled([
          api.getInstruments(),
          api.getInstitutions(),
          api.getAuditLogs(),
          api.getNotifications()
        ]);

        if (insts.status === 'fulfilled' && insts.value.length > 0) {
          setInstruments(insts.value);
        }
        if (instsList.status === 'fulfilled' && instsList.value.length > 0) {
          setInstitutions(instsList.value);
        }
        if (logs.status === 'fulfilled' && logs.value.length > 0) {
          setAuditLogs(logs.value);
        }
        if (notifs.status === 'fulfilled' && notifs.value.length > 0) {
          setNotifications(notifs.value);
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn('Backend service offline or unreachable, running in local fallback mode:', err);
        setBackendStatus('disconnected');
      }
    };

    loadBackendData();
    return () => { isMounted = false; };
  }, []);

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [detailModalInstrument, setDetailModalInstrument] = useState<FDRInstrument | null>(null);
  const [verificationModalInstrument, setVerificationModalInstrument] = useState<FDRInstrument | null>(null);
  const [renewalModalInstrument, setRenewalModalInstrument] = useState<FDRInstrument | null>(null);
  const [releaseModalInstrument, setReleaseModalInstrument] = useState<FDRInstrument | null>(null);

  // KOSH-GUARD Advanced Modal States
  const [dualTruthModalInstrument, setDualTruthModalInstrument] = useState<FDRInstrument | null>(null);
  const [bankPortalModalInstrument, setBankPortalModalInstrument] = useState<FDRInstrument | null>(null);
  const [forensicsModalInstrument, setForensicsModalInstrument] = useState<FDRInstrument | null>(null);
  const [activeScenarioBanner, setActiveScenarioBanner] = useState<{ id: string; title: string; subtitle: string } | null>(null);

  // 8-Scenario Blueprint Sandbox Runner
  const handleRunScenario = (scenarioNum: number) => {
    switch (scenarioNum) {
      case 1: {
        // 1. New FDR Submission & Extraction
        setIsRegisterModalOpen(true);
        setActiveScenarioBanner({
          id: 'SCENARIO-1',
          title: 'Scenario 1: New FDR Lodgement, Auto-Triage & Extraction',
          subtitle: 'Demonstrating automated field extraction with PaddleOCR confidence scoring and instant duplicate detection check.'
        });
        break;
      }
      case 2: {
        // 2. Track A NeSL e-BG Verification
        const target = instruments[0];
        setCurrentRole('VERIFICATION_OFFICER');
        setBankPortalModalInstrument(target);
        setActiveScenarioBanner({
          id: 'SCENARIO-2',
          title: 'Scenario 2: Track A NeSL Digital e-BG Verification',
          subtitle: 'Demonstrating instant cryptographic confirmation via National E-Governance Services Limited (NeSL) portal with zero manual delay.'
        });
        break;
      }
      case 3: {
        // 3. Approaching Maturity (T-30 SLA)
        setActiveTab('renewals');
        setSelectedFilter('RENEWAL_DUE');
        setActiveScenarioBanner({
          id: 'SCENARIO-3',
          title: 'Scenario 3: Proactive T-90/60/30/7 Maturity SLA Escalation Ladder',
          subtitle: 'Multi-channel dispatch (email, SMS, WhatsApp) with escalation to Scrutiny Officer → Section Officer → Bureau Head.'
        });
        break;
      }
      case 4: {
        // 4. Renewal Lineage (Parent-Child Tree)
        const target = instruments.find(i => i.id === 'inst-3') || instruments[2];
        setRenewalModalInstrument(target);
        setActiveScenarioBanner({
          id: 'SCENARIO-4',
          title: 'Scenario 4: Renewal Relational Chain Lineage (Parent → Child → Grandchild)',
          subtitle: 'Tracing unbroken chain of custody and cumulative security deposit history across multiple academic approval cycles.'
        });
        break;
      }
      case 5: {
        // 5. Discrepancy & Dual-Truth Workbench
        const target = instruments.find(i => i.id === 'inst-2') || instruments[1];
        setCurrentRole('SCRUTINY_OFFICER');
        setDualTruthModalInstrument(target);
        setActiveScenarioBanner({
          id: 'SCENARIO-5',
          title: 'Scenario 5: Dual-Truth Schema Reconciliation Mismatch',
          subtitle: 'Discrepancy detected: Institution claimed ₹2.00 Cr, but Bank confirmed ₹1.25 Cr. Auto-approval blocked by policy.'
        });
        break;
      }
      case 6: {
        // 6. Authorized Release (APH 6.46 + QR)
        const target = instruments.find(i => i.id === 'inst-4') || instruments[3];
        setCurrentRole('SECTION_OFFICER');
        setReleaseModalInstrument(target);
        setActiveScenarioBanner({
          id: 'SCENARIO-6',
          title: 'Scenario 6: 3-Tier Maker-Checker Release Gatekeeper',
          subtitle: 'APH Clause 6.46 release blocked due to missing Vigilance Cell clearance. QR code sanction generation prevented.'
        });
        break;
      }
      case 7: {
        // 7. Cross-Institution Duplicate Blocked / ELA Forensics
        const target = instruments.find(i => i.id === 'inst-2') || instruments[1];
        setCurrentRole('SCRUTINY_OFFICER');
        setForensicsModalInstrument(target);
        setActiveScenarioBanner({
          id: 'SCENARIO-7',
          title: 'Scenario 7: Pixel-Tampering & ELA Forensics Heatmap',
          subtitle: 'Demonstrating OpenCV compression error-level analysis detecting tampered deposit figures and non-linear font artifacts.'
        });
        break;
      }
      case 8: {
        // 8. Live DB Tamper Detection Drill
        setActiveTab('audit');
        setCurrentRole('AUDITOR');
        setActiveScenarioBanner({
          id: 'SCENARIO-8',
          title: 'Scenario 8: WORM Cryptographic Audit Chain & Row-Tamper Simulator',
          subtitle: 'Simulating SQL UPDATE on block payload. Demonstrates instant hash link breakage and real-time tamper alarm.'
        });
        break;
      }
    }
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveTab('instruments');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Total deposit amounts
  const totalDepositAmount = instruments.reduce((sum, item) => sum + item.amount, 0);
  const activeCount = instruments.filter(i => i.workflowStatus === 'VERIFIED').length;
  const expiringCount = instruments.filter(i => i.workflowStatus === 'RENEWAL_DUE').length;
  const pendingReviewsCount = instruments.filter(
    i => i.workflowStatus === 'SUBMITTED' || i.workflowStatus === 'UNDER_VERIFICATION' || i.workflowStatus === 'DISCREPANCY_FLAGGED'
  ).length;

  // Add audit log helper
  const addAuditLog = (action: string, details: string, previousValue?: string, newValue?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actorName: currentRole === 'INSTITUTION' ? 'Institution Signatory' : currentRole === 'OFFICIAL' ? 'Er. Alok Nath (Regional Regulatory Officer)' : 'Prof. T. G. Sitharam (Supervisory Admin)',
      actorRole: currentRole,
      action,
      entityType: 'INSTRUMENT',
      entityId: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      details,
      previousValue,
      newValue,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ipAddress: '164.100.158.42'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Add new instrument handler with backend persistence
  const handleAddInstrument = async (newInstrument: FDRInstrument) => {
    // Optimistic state update
    setInstruments(prev => [newInstrument, ...prev.filter(i => i.id !== newInstrument.id)]);

    try {
      const saved = await api.createInstrument(newInstrument);
      if (saved) {
        setInstruments(prev => [saved, ...prev.filter(i => i.id !== saved.id && i.id !== newInstrument.id)]);
      }
    } catch (err) {
      console.warn('Backend instrument create fallback:', err);
    }

    addAuditLog(
      'FDR_DEPOSIT_SUBMITTED',
      `New FDR #${newInstrument.referenceNumber} submitted for ${newInstrument.institutionName} (₹${newInstrument.amount.toLocaleString()}) with verification audit.`
    );
    // Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New FDR Lodged for Scrutiny',
      description: `${newInstrument.institutionName} filed ${newInstrument.bankName} FDR #${newInstrument.referenceNumber}`,
      type: 'VERIFICATION_REQUIRED',
      timestamp: 'Just now',
      unread: true,
      instrumentId: newInstrument.id
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Update existing instrument handler with backend sync
  const handleUpdateInstrument = async (updated: FDRInstrument) => {
    setInstruments(prev => prev.map(i => i.id === updated.id ? updated : i));

    try {
      await api.updateInstrument(updated.id, updated);
    } catch (err) {
      console.warn('Backend instrument update fallback:', err);
    }
  };

  // Renewal Completion handler with backend persistence
  const handleCompleteRenewal = async (previousId: string, renewalData: {
    newRefNumber: string;
    newMaturityDate: string;
    newAmount: number;
    renewalDocumentName: string;
    tenureYears: number;
  }) => {
    const prevItem = instruments.find(i => i.id === previousId);
    if (!prevItem) return;

    try {
      const res = await api.renewInstrument(previousId, renewalData);
      if (res && res.id) {
        setInstruments(prev => [res, ...prev.filter(i => i.id !== res.id && i.id !== previousId)]);
        addAuditLog(
          'FDR_RENEWAL_COMPLETED',
          `FDR #${prevItem.referenceNumber} renewed into #${renewalData.newRefNumber} with tenure extended to ${renewalData.newMaturityDate}.`
        );
        return;
      }
    } catch (err) {
      console.warn('Backend renewal endpoint fallback:', err);
    }

    const updatedInstrument: FDRInstrument = {
      ...prevItem,
      referenceNumber: renewalData.newRefNumber,
      maturityDate: renewalData.newMaturityDate,
      amount: renewalData.newAmount,
      tenureYears: renewalData.tenureYears,
      documentName: renewalData.renewalDocumentName,
      workflowStatus: 'VERIFIED',
      verificationStatus: 'VERIFIED',
      previousInstrumentId: previousId,
      renewalHistory: [
        {
          date: new Date().toISOString().slice(0, 10),
          reference: prevItem.referenceNumber,
          amount: prevItem.amount,
          renewalId: `ren-${Date.now()}`
        },
        ...(prevItem.renewalHistory || [])
      ],
      updatedAt: new Date().toISOString()
    };

    handleUpdateInstrument(updatedInstrument);
    addAuditLog(
      'FDR_RENEWAL_COMPLETED',
      `FDR #${prevItem.referenceNumber} renewed into #${renewalData.newRefNumber} with tenure extended to ${renewalData.newMaturityDate}.`
    );
  };

  // Notification click handler
  const handleNotificationClick = (notif: NotificationItem) => {
    // Mark clicked notification as read
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    if (notif.instrumentId) {
      const match = instruments.find(i => i.id === notif.instrumentId);
      if (match) {
        setDetailModalInstrument(match);
      }
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Direct college filter from directory
  const handleSelectInstitutionFDRs = (instCode: string) => {
    setSelectedFilter('ALL');
    setActiveTab('instruments');
  };

  return (
    <div className="min-h-screen bg-[#0038FF] flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black relative overflow-x-hidden w-full">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0"></div>
      
      {/* Global Neobrutalist Dock Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onOpenSearch={() => setActiveTab('instruments')}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllRead={handleMarkAllNotificationsRead}
        pendingReviewsCount={pendingReviewsCount}
        expiringRenewalsCount={expiringCount}
      />

      {/* Hero Section */}
      {activeTab === 'dashboard' && (
        <HeroSection
          currentRole={currentRole}
          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
          onNavigateToTab={setActiveTab}
          totalDepositAmount={totalDepositAmount}
          activeCount={activeCount}
          expiringCount={expiringCount}
        />
      )}

      {/* Header for non-dashboard tabs in Electric Blue zone */}
      {activeTab !== 'dashboard' && (
        <div className="relative z-10 px-6 pt-6 pb-10 md:px-12 max-w-[1440px] mx-auto w-full text-white">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="text-white/80 hover:text-[#CCFF00] transition cursor-pointer"
            >
              Dashboard
            </button>
            <span className="text-white/50">/</span>
            <span className="text-[#CCFF00]">
              {activeTab === 'instruments' ? 'Deposits Registry' : 
               activeTab === 'verification' ? 'Review Queue' : 
               activeTab === 'renewals' ? 'Maturity & Renewals' : 
               activeTab === 'releases' ? 'Release Sanctions' : 
               activeTab === 'reports' ? 'Executive Reports & KPIs' :
               activeTab === 'institutions' ? 'Institutions Directory' : 'WORM Cryptographic Audit Chain'}
            </span>
          </div>
          <h1 
            className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white m-0"
            style={{ 
              fontFamily: '"Arial Black", Impact, sans-serif',
              textShadow: '1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99'
            }}
          >
            {activeTab === 'instruments' ? 'Deposits Registry' : 
             activeTab === 'verification' ? 'Verification Scrutiny' : 
             activeTab === 'renewals' ? 'Maturity SLA Ladder' : 
             activeTab === 'releases' ? 'APH 6.46 Release Gate' : 
             activeTab === 'reports' ? 'Executive Analytics' :
             activeTab === 'institutions' ? 'Institutions Directory' : 'Cryptographic Audit'}
          </h1>
          <p className="text-white/80 text-xs md:text-sm font-semibold mt-1">
            AICTE Statutory Joint Lien Endorsement & Security Deposit Governance Architecture
          </p>
        </div>
      )}

      {/* Main Container - Neobrutalist White Rounded-T Surface */}
      <main className="bg-white text-black rounded-t-[2.5rem] md:rounded-t-[3.5rem] px-4 sm:px-8 lg:px-12 xl:px-16 py-10 md:py-16 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.2)] mt-auto w-full flex-1 space-y-12">
        
        {/* Live Backend Connection & Direct PC Media Uploads Status Bar */}
        <div className="bg-[#0038FF] border-3 border-black rounded-[2rem] p-4 text-white shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
              <Server className="w-6 h-6 text-[#0038FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase tracking-tight text-white">
                  {backendStatus === 'connected' ? 'Live Robust Backend Connected' : backendStatus === 'checking' ? 'Connecting to Backend...' : 'Local Cache Active'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#CCFF00] text-black font-black text-[10px] font-mono border border-black shadow-[1px_1px_0px_#000]">
                  <span className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-600 animate-ping' : 'bg-amber-600'}`}></span>
                  <span>PORT 5001 : ATOMIC JSON DB</span>
                </span>
              </div>
              <p className="text-white/85 font-bold text-xs mt-0.5">
                Atomic Write-Ahead DB · WORM Cryptographic Ledger · PC Media Uploads (`uploads/`) Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-mono">
            <div className="px-3.5 py-1.5 bg-black/40 rounded-xl border border-white/20 text-[#CCFF00] font-black">
              Instruments: <span className="text-white">{instruments.length}</span>
            </div>
            <div className="px-3.5 py-1.5 bg-black/40 rounded-xl border border-white/20 text-[#CCFF00] font-black hidden sm:block">
              Audit Logs: <span className="text-white">{auditLogs.length}</span>
            </div>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black uppercase text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition flex items-center gap-1.5"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Upload from PC</span>
            </button>
          </div>
        </div>

        {/* 8-Scenario Blueprint Sandbox Bar */}
        <InteractiveScenariosBar onRunScenario={handleRunScenario} />

        {/* Active Scenario Banner */}
        {activeScenarioBanner && (
          <div className="p-4 sm:p-5 rounded-[2rem] bg-[#CCFF00] border-2 border-black text-black shadow-lg flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0038FF] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                AICTE
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-black">
                    KOSH-GUARD Blueprint Simulation Active
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-black text-[#CCFF00] text-[10px] font-black font-mono">
                    {activeScenarioBanner.id.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-sm font-black text-black mt-0.5 uppercase">
                  {activeScenarioBanner.title}
                </h4>
                <p className="text-xs text-black/80 font-bold mt-0.5 max-w-3xl leading-relaxed">
                  {activeScenarioBanner.subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveScenarioBanner(null)}
              className="text-xs font-black text-black bg-white hover:bg-black hover:text-[#CCFF00] px-4 py-1.5 rounded-full border border-black cursor-pointer transition shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Navigation Breadcrumb for non-dashboard tabs */}
        {activeTab !== 'dashboard' && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 pb-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="hover:text-teal-700 font-medium flex items-center gap-1 transition cursor-pointer"
            >
              <span>Dashboard</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="font-heading font-bold text-slate-800 capitalize">
              {activeTab === 'instruments' ? 'Deposits Registry' : 
               activeTab === 'verification' ? 'Review Queue' : 
               activeTab === 'renewals' ? 'Maturity & Renewals' : 
               activeTab === 'releases' ? 'Release Sanctions' : 
               activeTab === 'reports' ? 'Executive Reports & KPIs' :
               activeTab === 'institutions' ? 'Institutions Directory' : 'WORM Cryptographic Audit Chain'}
            </span>
          </nav>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            {/* Regulatory KPI Cards */}
            <DashboardStats
              instruments={instruments}
              currentRole={currentRole}
              onFilterStatus={(status) => {
                setSelectedFilter(status);
                setActiveTab('instruments');
              }}
              onOpenReleaseModal={() => setActiveTab('releases')}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
            />

            {/* Statutory Joint Lien Lifecycle Guide */}
            <RegulatoryLifecycleGuide />

            {/* Rapid Deposit Surveillance & Query Console */}
            <RegulatoryAIAssistant
              instruments={instruments}
              onSelectInstrument={setDetailModalInstrument}
              onFilterChange={(st) => {
                setSelectedFilter(st);
                setActiveTab('instruments');
              }}
            />

            {/* Quick Overview Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-heading font-bold text-slate-900 tracking-tight">
                    Recent Deposits
                  </h3>
                  <p className="text-xs text-slate-500">
                    Overview of registered instruments and active workflows
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('instruments')}
                  className="pill-btn text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 group bg-teal-50 hover:bg-teal-100 border border-teal-200/80 px-4 py-1.5 transition cursor-pointer shadow-xs"
                >
                  <span>View All ({instruments.length})</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <FDRListView
                instruments={instruments.slice(0, 6)}
                currentRole={currentRole}
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                onSelectInstrument={setDetailModalInstrument}
                onOpenRenewalModal={setRenewalModalInstrument}
                onOpenReleaseModal={setReleaseModalInstrument}
                onOpenVerificationModal={setVerificationModalInstrument}
                onOpenDualTruthModal={setDualTruthModalInstrument}
                onOpenForensicsModal={setForensicsModalInstrument}
                onOpenBankPortalModal={setBankPortalModalInstrument}
              />
            </div>
          </div>
        )}

        {/* ALL FDR INSTRUMENTS TAB */}
        {activeTab === 'instruments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Deposits Registry
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete directory of active and archived security deposit instruments
                </p>
              </div>

              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="pill-btn flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-5 py-2.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Deposit</span>
              </button>
            </div>

            <FDRListView
              instruments={instruments}
              currentRole={currentRole}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
              onSelectInstrument={setDetailModalInstrument}
              onOpenRenewalModal={setRenewalModalInstrument}
              onOpenReleaseModal={setReleaseModalInstrument}
              onOpenVerificationModal={setVerificationModalInstrument}
              onOpenDualTruthModal={setDualTruthModalInstrument}
              onOpenForensicsModal={setForensicsModalInstrument}
              onOpenBankPortalModal={setBankPortalModalInstrument}
            />
          </div>
        )}

        {/* REVIEW & VERIFICATION QUEUE TAB */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-heading font-bold text-slate-900">
                  Verification & Review Queue
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deposit certificates awaiting scrutiny and joint lien endorsement
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Pending Review</span>
                <span className="text-2xl font-heading font-bold text-teal-700">
                  {instruments.filter(i => i.workflowStatus === 'SUBMITTED' || i.workflowStatus === 'DISCREPANCY_FLAGGED').length} Records
                </span>
              </div>
            </div>

            <FDRListView
              instruments={instruments.filter(i => i.workflowStatus === 'SUBMITTED' || i.workflowStatus === 'DISCREPANCY_FLAGGED')}
              currentRole={currentRole}
              selectedFilter="ALL"
              onFilterChange={setSelectedFilter}
              onSelectInstrument={setDetailModalInstrument}
              onOpenRenewalModal={setRenewalModalInstrument}
              onOpenReleaseModal={setReleaseModalInstrument}
              onOpenVerificationModal={setVerificationModalInstrument}
              onOpenDualTruthModal={setDualTruthModalInstrument}
              onOpenForensicsModal={setForensicsModalInstrument}
              onOpenBankPortalModal={setBankPortalModalInstrument}
            />
          </div>
        )}

        {/* RENEWALS & MATURITY TRACKER TAB */}
        {activeTab === 'renewals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-heading font-bold text-slate-900">
                  Maturity & Renewal Tracker
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deposit receipts approaching maturity threshold (&lt;30 days)
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-amber-600 block font-semibold uppercase tracking-wider">Expiring Soon</span>
                <span className="text-2xl font-heading font-bold text-amber-600">
                  {instruments.filter(i => i.workflowStatus === 'RENEWAL_DUE').length} Records
                </span>
              </div>
            </div>

            <FDRListView
              instruments={instruments.filter(i => i.workflowStatus === 'RENEWAL_DUE' || (i.renewalHistory && i.renewalHistory.length > 0))}
              currentRole={currentRole}
              selectedFilter="ALL"
              onFilterChange={setSelectedFilter}
              onSelectInstrument={setDetailModalInstrument}
              onOpenRenewalModal={setRenewalModalInstrument}
              onOpenReleaseModal={setReleaseModalInstrument}
              onOpenVerificationModal={setVerificationModalInstrument}
              onOpenDualTruthModal={setDualTruthModalInstrument}
              onOpenForensicsModal={setForensicsModalInstrument}
              onOpenBankPortalModal={setBankPortalModalInstrument}
            />
          </div>
        )}

        {/* RELEASE & REFUND PORTAL TAB */}
        {activeTab === 'releases' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-heading font-bold text-slate-900">
                  Release & Refund Sanctions
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Institutional requests for security deposit refund after tenure completion
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-purple-600 block font-semibold uppercase tracking-wider">Pending Sanction</span>
                <span className="text-2xl font-heading font-bold text-purple-700">
                  {instruments.filter(i => i.workflowStatus === 'RELEASE_REQUESTED').length} Requests
                </span>
              </div>
            </div>

            <FDRListView
              instruments={instruments.filter(i => i.workflowStatus === 'RELEASE_REQUESTED' || i.workflowStatus === 'RELEASED' || i.tenureYears >= 8)}
              currentRole={currentRole}
              selectedFilter="ALL"
              onFilterChange={setSelectedFilter}
              onSelectInstrument={setDetailModalInstrument}
              onOpenRenewalModal={setRenewalModalInstrument}
              onOpenReleaseModal={setReleaseModalInstrument}
              onOpenVerificationModal={setVerificationModalInstrument}
              onOpenDualTruthModal={setDualTruthModalInstrument}
              onOpenForensicsModal={setForensicsModalInstrument}
              onOpenBankPortalModal={setBankPortalModalInstrument}
            />
          </div>
        )}

        {/* EXECUTIVE MANAGEMENT & KPI REPORTS TAB */}
        {activeTab === 'reports' && (
          <ExecutiveReportsView 
            instruments={instruments} 
            institutions={institutions} 
          />
        )}

        {/* COLLEGES / INSTITUTIONS DIRECTORY TAB */}
        {activeTab === 'institutions' && (
          <InstitutionsDirectory
            institutions={institutions}
            instruments={instruments}
            onSelectInstitutionFDRs={handleSelectInstitutionFDRs}
          />
        )}

        {/* WORM CRYPTOGRAPHIC AUDIT LEDGER TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-8">
            <CryptographicLedgerView />
            
            <div className="pt-6 border-t border-slate-200">
              <div className="mb-4">
                <h3 className="text-lg font-heading font-bold text-slate-900">
                  Raw Security Deposit Event Stream
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time transaction activity feed logged from client actions
                </p>
              </div>
              <AuditTrailView logs={auditLogs} />
            </div>
          </div>
        )}

      </main>

      {/* Global Modals */}
      <FDRRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        institutions={institutions}
        onAddInstrument={handleAddInstrument}
      />

      <VerificationDrawer
        isOpen={!!verificationModalInstrument}
        instrument={verificationModalInstrument}
        onClose={() => setVerificationModalInstrument(null)}
        currentRole={currentRole}
        onUpdateInstrument={handleUpdateInstrument}
        onAddAuditLog={addAuditLog}
      />

      <RenewalWorkflowModal
        isOpen={!!renewalModalInstrument}
        instrument={renewalModalInstrument}
        onClose={() => setRenewalModalInstrument(null)}
        onCompleteRenewal={handleCompleteRenewal}
      />

      <ReleaseWorkflowModal
        isOpen={!!releaseModalInstrument}
        instrument={releaseModalInstrument}
        onClose={() => setReleaseModalInstrument(null)}
        currentRole={currentRole}
        onUpdateInstrument={handleUpdateInstrument}
        onAddAuditLog={addAuditLog}
      />

      <InstrumentDetailModal
        isOpen={!!detailModalInstrument}
        instrument={detailModalInstrument}
        onClose={() => setDetailModalInstrument(null)}
        currentRole={currentRole}
        onOpenVerificationModal={setVerificationModalInstrument}
        onOpenRenewalModal={setRenewalModalInstrument}
        onOpenReleaseModal={setReleaseModalInstrument}
      />

      {/* KOSH-GUARD Workbench Modals */}
      <DualTruthReconciliationWorkbench
        isOpen={!!dualTruthModalInstrument}
        instrument={dualTruthModalInstrument}
        onClose={() => setDualTruthModalInstrument(null)}
        currentRole={currentRole}
        onUpdateInstrument={handleUpdateInstrument}
        onAddAuditLog={addAuditLog}
      />

      <BankVerificationPortalModal
        isOpen={!!bankPortalModalInstrument}
        instrument={bankPortalModalInstrument}
        onClose={() => setBankPortalModalInstrument(null)}
        currentRole={currentRole}
        onUpdateInstrument={handleUpdateInstrument}
        onAddAuditLog={addAuditLog}
      />

      <ForensicsWorkbenchModal
        isOpen={!!forensicsModalInstrument}
        instrument={forensicsModalInstrument}
        onClose={() => setForensicsModalInstrument(null)}
        currentRole={currentRole}
        onAddAuditLog={addAuditLog}
      />

      {/* Official Cinematic Footer */}
      <Footer 
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onNavigateToTab={setActiveTab}
      />

    </div>
  );
};

export default App;
