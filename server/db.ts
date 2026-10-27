import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { 
  Institution, 
  FDRInstrument, 
  AuditLog, 
  NotificationItem, 
  CryptographicAuditBlock,
  InstrumentStatus
} from '../src/types';
import {
  INITIAL_INSTITUTIONS,
  INITIAL_INSTRUMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CRYPTO_BLOCKS,
  INITIAL_NOTIFICATIONS
} from '../src/data/mockData';
import { computeBlockHash, computePayloadHash, GENESIS_PREV_HASH } from '../src/lib/cryptoLedger';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const DB_FILE = path.join(DATA_DIR, 'fintrack.json');
const BACKUP_FILE = path.join(DATA_DIR, 'fintrack.backup.json');

export interface DatabaseSchema {
  version: string;
  lastUpdated: string;
  institutions: Institution[];
  instruments: FDRInstrument[];
  auditLogs: AuditLog[];
  cryptoBlocks: CryptographicAuditBlock[];
  notifications: NotificationItem[];
}

export class Database {
  private static instance: Database;
  private data: DatabaseSchema;
  private isSaving = false;

  private constructor() {
    this.data = this.init();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private init(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        if (parsed.instruments && parsed.institutions) {
          console.log(`[DB] Successfully loaded persistent store with ${parsed.instruments.length} deposits.`);
          return parsed;
        }
      } catch (err) {
        console.error('[DB] Corrupted database file detected. Attempting to restore from backup or seed...', err);
        if (fs.existsSync(BACKUP_FILE)) {
          try {
            const raw = fs.readFileSync(BACKUP_FILE, 'utf-8');
            return JSON.parse(raw);
          } catch {}
        }
      }
    }

    // Seed default data
    console.log('[DB] Initializing new persistent store with AICTE KOSH-GUARD statutory seed records...');
    const initialData: DatabaseSchema = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      institutions: JSON.parse(JSON.stringify(INITIAL_INSTITUTIONS)),
      instruments: JSON.parse(JSON.stringify(INITIAL_INSTRUMENTS)),
      auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)),
      cryptoBlocks: JSON.parse(JSON.stringify(INITIAL_CRYPTO_BLOCKS)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS))
    };

    this.saveDirect(initialData);
    return initialData;
  }

  private saveDirect(dataToSave: DatabaseSchema) {
    try {
      const serialized = JSON.stringify(dataToSave, null, 2);
      const tempPath = `${DB_FILE}.${Date.now()}.tmp`;
      fs.writeFileSync(tempPath, serialized, 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
      // Update backup asynchronously
      fs.copyFileSync(DB_FILE, BACKUP_FILE);
    } catch (err) {
      console.error('[DB] Failed to persist data to disk:', err);
    }
  }

  private persist() {
    this.data.lastUpdated = new Date().toISOString();
    this.saveDirect(this.data);
  }

  // --- INSTRUMENTS CRUD ---

  public getInstruments(filters?: {
    status?: string;
    bank?: string;
    institution?: string;
    search?: string;
  }): FDRInstrument[] {
    let results = [...this.data.instruments];

    if (!filters) return results;

    if (filters.status && filters.status !== 'ALL') {
      results = results.filter(i => i.workflowStatus === filters.status);
    }

    if (filters.bank && filters.bank !== 'ALL') {
      results = results.filter(i => i.bankName.toLowerCase().includes(filters.bank!.toLowerCase()));
    }

    if (filters.institution && filters.institution !== 'ALL') {
      results = results.filter(i => 
        i.institutionId === filters.institution || 
        i.institutionCode === filters.institution ||
        i.institutionName.toLowerCase().includes(filters.institution!.toLowerCase())
      );
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(i => 
        i.referenceNumber.toLowerCase().includes(q) ||
        i.institutionName.toLowerCase().includes(q) ||
        i.bankName.toLowerCase().includes(q) ||
        i.institutionCode.toLowerCase().includes(q)
      );
    }

    return results;
  }

  public getInstrumentById(idOrRef: string): FDRInstrument | undefined {
    return this.data.instruments.find(i => i.id === idOrRef || i.referenceNumber === idOrRef);
  }

  public createInstrument(instrument: FDRInstrument): FDRInstrument {
    // Generate id if missing
    const newInst: FDRInstrument = {
      ...instrument,
      id: instrument.id || `fdr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: instrument.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.instruments.unshift(newInst);

    // Add corresponding audit block
    this.addAuditLog({
      actorName: 'Institution Signatory',
      actorRole: 'INSTITUTION',
      action: 'FDR_DEPOSIT_LODGED',
      entityType: 'INSTRUMENT',
      entityId: newInst.referenceNumber,
      details: `Lodged ${newInst.bankName} FDR #${newInst.referenceNumber} for ${newInst.institutionName} (₹${newInst.amount.toLocaleString('en-IN')}) with joint lien clause ${newInst.jointLienAICTE ? 'ENDORSED' : 'MISSING'}.`
    });

    // Add notification
    this.addNotification({
      title: 'New Security Deposit Lodged for Scrutiny',
      description: `${newInst.institutionName} lodged ₹${(newInst.amount / 100000).toFixed(1)}L FDR #${newInst.referenceNumber}. Awaiting regulatory scrutiny.`,
      type: 'VERIFICATION_REQUIRED',
      instrumentId: newInst.id
    });

    this.persist();
    return newInst;
  }

  public updateInstrument(id: string, updates: Partial<FDRInstrument>): FDRInstrument | null {
    const idx = this.data.instruments.findIndex(i => i.id === id || i.referenceNumber === id);
    if (idx === -1) return null;

    const current = this.data.instruments[idx];
    const prevStatus = current.workflowStatus;

    const updated: FDRInstrument = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.data.instruments[idx] = updated;

    // Log status transitions if status changed
    if (updates.workflowStatus && updates.workflowStatus !== prevStatus) {
      this.addAuditLog({
        actorName: 'AICTE Regulatory System',
        actorRole: 'OFFICIAL',
        action: 'WORKFLOW_STATE_TRANSITION',
        entityType: 'INSTRUMENT',
        entityId: updated.referenceNumber,
        details: `Workflow status changed from ${prevStatus} to ${updates.workflowStatus} for FDR #${updated.referenceNumber}`,
        previousValue: prevStatus,
        newValue: updates.workflowStatus
      });
    }

    this.persist();
    return updated;
  }

  public deleteInstrument(id: string): boolean {
    const idx = this.data.instruments.findIndex(i => i.id === id || i.referenceNumber === id);
    if (idx === -1) return false;

    const removed = this.data.instruments.splice(idx, 1)[0];
    this.addAuditLog({
      actorName: 'System Administrator',
      actorRole: 'ADMIN',
      action: 'INSTRUMENT_DELETED',
      entityType: 'INSTRUMENT',
      entityId: removed.referenceNumber,
      details: `Deleted instrument #${removed.referenceNumber} (${removed.institutionName})`
    });

    this.persist();
    return true;
  }

  // --- INSTITUTIONS ---

  public getInstitutions(): Institution[] {
    return [...this.data.institutions];
  }

  public getInstitutionById(idOrCode: string): Institution | undefined {
    return this.data.institutions.find(i => i.id === idOrCode || i.code === idOrCode);
  }

  // --- AUDIT LOGS & CRYPTOGRAPHIC LEDGER ---

  public getAuditLogs(): AuditLog[] {
    return [...this.data.auditLogs];
  }

  public addAuditLog(entry: {
    actorName: string;
    actorRole: any;
    action: string;
    entityType: 'INSTRUMENT' | 'INSTITUTION' | 'RELEASE_REQUEST' | 'RENEWAL' | 'SYSTEM' | 'BLOCKCHAIN';
    entityId: string;
    details: string;
    previousValue?: string;
    newValue?: string;
  }): AuditLog {
    const lastBlock = this.data.cryptoBlocks.length > 0 
      ? this.data.cryptoBlocks[this.data.cryptoBlocks.length - 1] 
      : null;

    const newBlock = this.addCryptoBlock({
      actorName: entry.actorName,
      actorRole: String(entry.actorRole),
      action: entry.action,
      entityId: entry.entityId,
      details: entry.details
    });

    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorName: entry.actorName,
      actorRole: entry.actorRole,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      details: entry.details,
      previousValue: entry.previousValue,
      newValue: entry.newValue,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ipAddress: '164.100.158.42',
      blockHash: newBlock.blockHash
    };

    this.data.auditLogs.unshift(newLog);
    this.persist();
    return newLog;
  }

  public getCryptoBlocks(): CryptographicAuditBlock[] {
    return [...this.data.cryptoBlocks];
  }

  public addCryptoBlock(entry: {
    actorName: string;
    actorRole: string;
    action: string;
    entityId: string;
    details: string;
  }): CryptographicAuditBlock {
    const lastBlock = this.data.cryptoBlocks.length > 0
      ? this.data.cryptoBlocks[this.data.cryptoBlocks.length - 1]
      : null;

    const blockIndex = lastBlock ? lastBlock.blockIndex + 1 : 0;
    const previousHash = lastBlock ? lastBlock.blockHash : GENESIS_PREV_HASH;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const payloadHash = computePayloadHash({
      blockIndex,
      timestamp,
      actorName: entry.actorName,
      actorRole: entry.actorRole,
      action: entry.action,
      entityId: entry.entityId,
      details: entry.details
    });

    const blockHash = computeBlockHash(previousHash, payloadHash, timestamp);

    const block: CryptographicAuditBlock = {
      blockIndex,
      timestamp,
      actorName: entry.actorName,
      actorRole: entry.actorRole,
      action: entry.action,
      entityId: entry.entityId,
      details: entry.details,
      previousHash,
      payloadHash,
      blockHash,
      isTampered: false
    };

    this.data.cryptoBlocks.push(block);
    return block;
  }

  public verifyCryptoLedger(): { isValid: boolean; brokenAtIndex: number | null; totalBlocks: number } {
    const blocks = this.data.cryptoBlocks;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const expectedPrev = i === 0 ? GENESIS_PREV_HASH : blocks[i - 1].blockHash;
      if (b.previousHash !== expectedPrev || b.isTampered) {
        return { isValid: false, brokenAtIndex: i, totalBlocks: blocks.length };
      }

      const expectedPayload = computePayloadHash({
        blockIndex: b.blockIndex,
        timestamp: b.timestamp,
        actorName: b.actorName,
        actorRole: b.actorRole,
        action: b.action,
        entityId: b.entityId,
        details: b.details
      });

      if (b.payloadHash !== expectedPayload) {
        return { isValid: false, brokenAtIndex: i, totalBlocks: blocks.length };
      }

      const expectedBlock = computeBlockHash(b.previousHash, b.payloadHash, b.timestamp);
      if (b.blockHash !== expectedBlock) {
        return { isValid: false, brokenAtIndex: i, totalBlocks: blocks.length };
      }
    }
    return { isValid: true, brokenAtIndex: null, totalBlocks: blocks.length };
  }

  public tamperCryptoBlock(blockIndex: number): boolean {
    if (blockIndex < 0 || blockIndex >= this.data.cryptoBlocks.length) return false;
    const block = this.data.cryptoBlocks[blockIndex];
    block.details = `[TAMPERED CONTENT - UNAUTHORIZED SQL INJECTION] Modified amount to ₹9,99,99,999`;
    block.isTampered = true;
    this.persist();
    return true;
  }

  public repairCryptoLedger(): boolean {
    // Recompute all hashes sequentially
    for (let i = 0; i < this.data.cryptoBlocks.length; i++) {
      const b = this.data.cryptoBlocks[i];
      b.isTampered = false;
      b.previousHash = i === 0 ? GENESIS_PREV_HASH : this.data.cryptoBlocks[i - 1].blockHash;
      b.payloadHash = computePayloadHash({
        blockIndex: b.blockIndex,
        timestamp: b.timestamp,
        actorName: b.actorName,
        actorRole: b.actorRole,
        action: b.action,
        entityId: b.entityId,
        details: b.details
      });
      b.blockHash = computeBlockHash(b.previousHash, b.payloadHash, b.timestamp);
    }
    this.persist();
    return true;
  }

  // --- NOTIFICATIONS ---

  public getNotifications(): NotificationItem[] {
    return [...this.data.notifications];
  }

  public markNotificationRead(id: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id);
    if (!notif) return false;
    notif.unread = false;
    this.persist();
    return true;
  }

  public markAllNotificationsRead(): void {
    this.data.notifications.forEach(n => { n.unread = false; });
    this.persist();
  }

  public addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'unread'> & { timestamp?: string }): NotificationItem {
    const item: NotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: notif.title,
      description: notif.description,
      type: notif.type,
      timestamp: notif.timestamp || 'Just now',
      unread: true,
      instrumentId: notif.instrumentId
    };
    this.data.notifications.unshift(item);
    this.persist();
    return item;
  }

  // --- ANALYTICS SUMMARY & CSV EXPORT ---

  public getAnalyticsSummary() {
    const instruments = this.data.instruments;
    const totalDeposits = instruments.reduce((sum, i) => sum + i.amount, 0);
    const activeVerifiedCount = instruments.filter(i => i.workflowStatus === 'VERIFIED').length;
    const renewalsDueCount = instruments.filter(i => i.workflowStatus === 'RENEWAL_DUE').length;
    const discrepanciesCount = instruments.filter(i => i.workflowStatus === 'DISCREPANCY_FLAGGED').length;
    const pendingReviewsCount = instruments.filter(i => 
      i.workflowStatus === 'SUBMITTED' || 
      i.workflowStatus === 'UNDER_VERIFICATION' || 
      i.workflowStatus === 'EXTRACTION_PENDING'
    ).length;

    // By bank breakdown
    const bankBreakdown: Record<string, { count: number; totalAmount: number }> = {};
    instruments.forEach(inst => {
      const b = inst.bankName || 'Other';
      if (!bankBreakdown[b]) bankBreakdown[b] = { count: 0, totalAmount: 0 };
      bankBreakdown[b].count++;
      bankBreakdown[b].totalAmount += inst.amount;
    });

    // By category
    const categoryBreakdown: Record<string, number> = {};
    instruments.forEach(inst => {
      const p = inst.purpose || 'Other';
      categoryBreakdown[p] = (categoryBreakdown[p] || 0) + inst.amount;
    });

    return {
      totalDeposits,
      totalInstrumentsCount: instruments.length,
      activeVerifiedCount,
      renewalsDueCount,
      discrepanciesCount,
      pendingReviewsCount,
      bankBreakdown,
      categoryBreakdown,
      institutionsCount: this.data.institutions.length,
      auditBlocksCount: this.data.cryptoBlocks.length
    };
  }

  public generateCSVExport(): string {
    const headers = [
      'Reference Number',
      'Institution Code',
      'Institution Name',
      'Bank Name',
      'Branch',
      'Amount (INR)',
      'Issue Date',
      'Maturity Date',
      'Tenure (Years)',
      'Interest Rate (%)',
      'Joint Lien AICTE',
      'Auto-Renewal Clause',
      'Workflow Status',
      'Verification Status'
    ];

    const rows = this.data.instruments.map(i => [
      `"${i.referenceNumber}"`,
      `"${i.institutionCode}"`,
      `"${i.institutionName.replace(/"/g, '""')}"`,
      `"${i.bankName.replace(/"/g, '""')}"`,
      `"${i.branchName.replace(/"/g, '""')}"`,
      i.amount,
      `"${i.issueDate}"`,
      `"${i.maturityDate}"`,
      i.tenureYears,
      i.interestRate,
      i.jointLienAICTE ? 'YES' : 'NO',
      i.autoRenewalClause ? 'YES' : 'NO',
      `"${i.workflowStatus}"`,
      `"${i.verificationStatus}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  public resetDatabase(): void {
    console.log('[DB] Resetting database to initial statutory seed state...');
    this.data = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      institutions: JSON.parse(JSON.stringify(INITIAL_INSTITUTIONS)),
      instruments: JSON.parse(JSON.stringify(INITIAL_INSTRUMENTS)),
      auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)),
      cryptoBlocks: JSON.parse(JSON.stringify(INITIAL_CRYPTO_BLOCKS)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS))
    };
    this.persist();
  }
}

export const db = Database.getInstance();
