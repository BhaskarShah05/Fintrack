import React, { useState } from 'react';
import {
  LayoutGrid,
  Landmark,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  Building2,
  ScrollText,
  Search,
  Plus,
  Bell,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { UserRole, NotificationItem } from '../types';
import { Dock, DockIcon, DockItem, DockLabel } from './ui/dock';

export interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenRegisterModal: () => void;
  onOpenSearch: () => void;
  notifications: NotificationItem[];
  onNotificationClick: (notif: NotificationItem) => void;
  onMarkAllRead?: () => void;
  pendingReviewsCount?: number;
  expiringRenewalsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  onOpenRegisterModal,
  onOpenSearch,
  notifications,
  onNotificationClick,
  onMarkAllRead,
  pendingReviewsCount = 0,
  expiringRenewalsCount = 0
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Close dropdowns on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifDropdown(false);
        setShowRoleDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const roleMeta: Record<string, { label: string; sublabel: string; tag: string; icon: any }> = {
    INSTITUTION: {
      label: 'Institution',
      sublabel: 'Technical College / Trust Signatory',
      tag: 'IN',
      icon: Building2,
    },
    SCRUTINY_OFFICER: {
      label: 'Scrutiny Officer (Tier 1)',
      sublabel: 'OCR & Forensics Workbench',
      tag: 'SO',
      icon: ShieldCheck,
    },
    VERIFICATION_OFFICER: {
      label: 'Verification Officer',
      sublabel: 'NeSL e-BG & Bank Nodal Attestation',
      tag: 'VO',
      icon: Landmark,
    },
    SECTION_OFFICER: {
      label: 'Section Officer (Tier 2)',
      sublabel: 'AICTE Joint Lien Endorsement',
      tag: 'SEC',
      icon: CheckCircle2,
    },
    BUREAU_HEAD: {
      label: 'Bureau Head (Tier 3)',
      sublabel: 'Final Sanctions & Policy Clearances',
      tag: 'BH',
      icon: UserCheck,
    },
    FINANCE: {
      label: 'Finance Bureau',
      sublabel: 'Refunds, NOC & Ledger Integrity',
      tag: 'FIN',
      icon: Landmark,
    },
    AUDITOR: {
      label: 'C&AG Auditor',
      sublabel: 'Independent WORM Cryptographic Audit',
      tag: 'AUD',
      icon: ScrollText,
    },
    ADMIN: {
      label: 'System Admin',
      sublabel: 'Central Master Configuration',
      tag: 'ADM',
      icon: UserCheck,
    },
    OFFICIAL: {
      label: 'Regulatory Official',
      sublabel: 'Regional AICTE Officer (Tier 1 & 2)',
      tag: 'RO',
      icon: ShieldCheck,
    },
    SUPERVISOR: {
      label: 'Central Admin',
      sublabel: 'Central Oversight & Sanctions',
      tag: 'AD',
      icon: UserCheck,
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutGrid,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'instruments',
      label: 'Deposits Registry',
      icon: Landmark,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'verification',
      label: 'Review Queue',
      icon: ShieldCheck,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : null,
      badgeColor: 'bg-rose-500'
    },
    {
      id: 'renewals',
      label: 'Renewal Alerts',
      icon: Clock,
      badge: expiringRenewalsCount > 0 ? expiringRenewalsCount : null,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'releases',
      label: 'Release Sanctions',
      icon: ArrowUpRight,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'reports',
      label: 'Executive Reports',
      icon: ScrollText,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'institutions',
      label: 'Institutions',
      icon: Building2,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'audit',
      label: 'WORM Crypto Ledger',
      icon: ScrollText,
      badge: null,
      badgeColor: ''
    }
  ];

  return (
    <header className="sticky top-2 sm:top-4 z-40 px-3 sm:px-6 py-1 flex items-center justify-between max-w-[1440px] mx-auto w-full pointer-events-auto">
      {/* Left Branding (Theme Logo) */}
      <div 
        className="hidden md:flex items-center gap-1.5 cursor-pointer shrink-0 select-none group"
        onClick={() => onTabChange('dashboard')}
        title="AICTE KOSH-GUARD Portal"
      >
        <div className="bg-white text-black font-black tracking-tight text-xs md:text-sm px-3.5 py-1.5 rounded-2xl rounded-bl-sm relative shadow-[3px_3px_0px_#000] border-2 border-black group-hover:scale-105 transition-transform">
          AICTE
          <div 
            className="absolute -bottom-1.5 left-0 w-3 h-3 bg-white" 
            style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
          />
        </div>
        <div className="bg-[#CCFF00] text-black font-black text-xs md:text-sm px-3.5 py-1.5 rounded-full border-2 border-black shadow-[3px_3px_0px_#000] group-hover:scale-105 transition-transform">
          KOSH
        </div>
      </div>

      {/* Center Apple-style Neobrutalist Dock */}
      <div className="relative max-w-full overflow-visible mx-auto md:mx-0">
        <div className="max-w-[calc(100vw-1rem)] overflow-visible py-1 px-1 flex items-center justify-center">
          <Dock
            className="items-center bg-white border-3 border-black shadow-[6px_6px_0px_#000000] backdrop-blur-xl px-3 sm:px-4 py-2 rounded-full gap-1.5 sm:gap-2.5 overflow-visible"
            panelHeight={58}
            magnification={68}
            distance={120}
          >
          {/* Logo Dock Item (Mobile visible) */}
          <DockItem
            onClick={() => onTabChange('dashboard')}
            aria-label="FinTrack Home"
            className="aspect-square rounded-full bg-[#0038FF] border-2 border-black text-[#CCFF00] hover:bg-black hover:text-[#CCFF00] transition-all duration-200 shadow-[2px_2px_0px_#000] flex items-center justify-center p-0.5"
          >
            <DockLabel side="bottom">
              FinTrack Portal (AICTE APH 2024-27)
            </DockLabel>
            <DockIcon>
              <div className="w-8 h-8 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shadow-xs border border-black">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 18 L10 6 L14 12 L20 4" />
                  <circle cx="20" cy="4" r="1.5" fill="currentColor" />
                </svg>
              </div>
            </DockIcon>
          </DockItem>

          {/* Separator */}
          <div aria-hidden="true" className="w-0.5 h-6 bg-black/20 mx-1 shrink-0" />

          {/* Core Navigation Views */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <DockItem
                key={item.id}
                onClick={() => onTabChange(item.id)}
                aria-label={item.label}
                className={`aspect-square rounded-full transition-all duration-200 relative flex items-center justify-center ${
                  isActive
                    ? 'bg-[#0038FF] border-2 border-black text-[#CCFF00] font-black shadow-[3px_3px_0px_#000] scale-105'
                    : 'bg-white border-2 border-black/20 text-black hover:text-black hover:border-black hover:bg-[#CCFF00] hover:shadow-[2px_2px_0px_#000]'
                }`}
              >
                <DockLabel side="bottom">
                  {item.label}
                </DockLabel>

                <DockIcon>
                  <Icon className="size-full stroke-[2.4]" />
                </DockIcon>

                {/* Badge if pending items */}
                {item.badge && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 rounded-full bg-[#CCFF00] text-black text-[10px] font-black border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center"
                  >
                    {item.badge}
                  </span>
                )}

                {/* Active Indicator Dot */}
                {isActive && (
                  <motion.span
                    layoutId="active-nav-dot"
                    aria-hidden="true"
                    className="w-2 h-2 rounded-full bg-[#CCFF00] absolute bottom-1 left-1/2 -translate-x-1/2 border border-black shadow-xs"
                  />
                )}
              </DockItem>
            );
          })}

          {/* Separator */}
          <div aria-hidden="true" className="w-0.5 h-6 bg-black/20 mx-1 shrink-0" />

          {/* Quick Search */}
          <DockItem
            onClick={onOpenSearch}
            aria-label="Search Records"
            className="aspect-square rounded-full bg-white border-2 border-black/20 text-black hover:border-black hover:bg-[#CCFF00] hover:shadow-[2px_2px_0px_#000] transition-all duration-200 flex items-center justify-center"
          >
            <DockLabel side="bottom">
              Search Records (⌘K)
            </DockLabel>
            <DockIcon>
              <Search className="size-full stroke-[2.4]" />
            </DockIcon>
          </DockItem>

          {/* Notifications Trigger */}
          <DockItem
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowRoleDropdown(false);
            }}
            aria-label="Notifications"
            className="aspect-square rounded-full bg-white border-2 border-black/20 text-black hover:border-black hover:bg-[#CCFF00] hover:shadow-[2px_2px_0px_#000] transition-all duration-200 relative flex items-center justify-center"
          >
            <DockLabel side="bottom">
              Notifications {unreadCount > 0 ? `(${unreadCount} unread)` : ''}
            </DockLabel>
            <DockIcon>
              <Bell className="size-full stroke-[2.4]" />
            </DockIcon>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#CCFF00] border-2 border-black shadow-[1px_1px_0px_#000]" />
            )}
          </DockItem>

          {/* Role Switcher Trigger */}
          <DockItem
            onClick={() => {
              setShowRoleDropdown(!showRoleDropdown);
              setShowNotifDropdown(false);
            }}
            aria-label="Switch Role"
            className="aspect-square rounded-full bg-white border-2 border-black text-black hover:border-black hover:bg-[#CCFF00] hover:shadow-[2px_2px_0px_#000] transition-all duration-200 flex items-center justify-center p-0.5"
          >
            <DockLabel side="bottom">
              Role: {roleMeta[currentRole]?.label || currentRole}
            </DockLabel>
            <DockIcon>
              <div className="w-8 h-8 rounded-full bg-[#0038FF] border-2 border-black text-[#CCFF00] flex items-center justify-center font-black text-[11px] shadow-[1px_1px_0px_#000]">
                {roleMeta[currentRole]?.tag || 'RO'}
              </div>
            </DockIcon>
          </DockItem>

          {/* New Deposit Action */}
          <DockItem
            onClick={onOpenRegisterModal}
            aria-label="New Deposit"
            className="aspect-square rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black border-2 border-black shadow-[3px_3px_0px_#000] hover:scale-110 transition-all duration-200 flex items-center justify-center"
          >
            <DockLabel side="bottom">
              New Deposit (+)
            </DockLabel>
            <DockIcon>
              <Plus className="size-full stroke-[3]" />
            </DockIcon>
          </DockItem>
        </Dock>
        </div>

        {/* Notifications Dropdown (anchored to top dock) */}
        {showNotifDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
            <div className="absolute right-2 sm:right-16 top-full mt-2 w-84 max-w-[calc(100vw-2rem)] bg-white rounded-[2rem] shadow-[10px_10px_0px_#000] border-4 border-black p-4 z-50 text-black animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
              <div className="h-2 w-[calc(100%+2rem)] bg-[#CCFF00] border-b-2 border-black -mx-4 -mt-4 mb-3" />
              <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                <span className="font-black uppercase tracking-tight text-sm text-black">Notifications</span>
                <button
                  type="button"
                  onClick={() => {
                    if (onMarkAllRead) onMarkAllRead();
                  }}
                  className="text-[11px] text-[#0038FF] font-black uppercase tracking-wider hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              </div>
              <div className="divide-y divide-black/10 max-h-64 overflow-y-auto mt-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      onNotificationClick(notif);
                      setShowNotifDropdown(false);
                    }}
                    className={`p-3 rounded-2xl cursor-pointer hover:bg-[#F8F9FA] border-2 border-transparent hover:border-black transition my-1 text-left ${notif.unread ? 'bg-[#CCFF00]/25 border-black/20' : ''}`}
                  >
                    <p className="text-xs font-black text-black">{notif.title}</p>
                    <p className="text-[11px] text-black/70 font-medium mt-0.5 line-clamp-2">{notif.description}</p>
                    <span className="text-[10px] text-black/50 font-bold mt-1 block font-mono">{notif.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Role Switcher Dropdown (anchored to top dock) */}
        {showRoleDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowRoleDropdown(false)} />
            <div className="absolute right-2 sm:right-8 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-[2rem] shadow-[10px_10px_0px_#000] border-4 border-black p-4 z-50 text-black animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
              <div className="h-2 w-[calc(100%+2rem)] bg-[#CCFF00] border-b-2 border-black -mx-4 -mt-4 mb-3" />
              <div className="pb-2 border-b-2 border-black mb-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-black font-black">
                  KOSH-GUARD RBAC (8 ROLES)
                </span>
                <span className="text-[10px] bg-[#CCFF00] text-black border border-black px-2 py-0.5 rounded-full font-mono font-black">
                  APH 2024-27
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-1.5">
                {([
                  'SCRUTINY_OFFICER',
                  'VERIFICATION_OFFICER',
                  'SECTION_OFFICER',
                  'BUREAU_HEAD',
                  'FINANCE',
                  'AUDITOR',
                  'INSTITUTION',
                  'ADMIN'
                ] as UserRole[]).map((r) => {
                  const meta = roleMeta[r] || { label: r, sublabel: '', tag: r.slice(0, 2) };
                  const isSelected = currentRole === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        onRoleChange(r);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition cursor-pointer border-2 ${
                        isSelected 
                          ? 'bg-[#0038FF] text-white border-black shadow-[4px_4px_0px_#000]' 
                          : 'bg-white text-black border-transparent hover:border-black hover:bg-[#CCFF00]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-8 h-8 rounded-xl text-[11px] font-black font-mono flex items-center justify-center shrink-0 border-2 border-black ${
                          isSelected ? 'bg-[#CCFF00] text-black shadow-[2px_2px_0px_#000]' : 'bg-[#F8F9FA] text-black'
                        }`}>
                          {meta.tag}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-black truncate">{meta.label}</p>
                          <p className={`text-[10px] truncate font-medium ${isSelected ? 'text-white/80' : 'text-black/60'}`}>{meta.sublabel}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] border border-black shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Action Button (Theme pill button) */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <button 
          onClick={() => {
            setShowRoleDropdown(!showRoleDropdown);
            setShowNotifDropdown(false);
          }}
          className="flex items-center gap-2 px-5 py-2 rounded-full border-2 border-white text-white text-xs md:text-sm font-black hover:bg-white hover:text-[#0038FF] transition-all cursor-pointer shadow-sm"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] border border-black animate-pulse" />
          <span>{roleMeta[currentRole]?.label || currentRole}</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
