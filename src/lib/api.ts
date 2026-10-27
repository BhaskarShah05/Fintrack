import { 
  FDRInstrument, 
  Institution, 
  AuditLog, 
  NotificationItem, 
  CryptographicAuditBlock 
} from '../types';
import { UploadedMediaResponse } from '../../server/upload';
import { analyzeDocumentInBrowser } from './clientDocumentAnalyzer';

const API_BASE = '/api';

class ApiClient {
  private isOnline = true;

  public async getHealth(): Promise<{ status: string; uptime: number; metrics: any }> {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  }

  public async checkHealth() {
    try {
      const data = await this.getHealth();
      this.isOnline = true;
      return { isOnline: true, data };
    } catch {
      this.isOnline = false;
      return { isOnline: false, data: null };
    }
  }

  // --- INSTRUMENTS ---

  public async getInstruments(params?: { status?: string; bank?: string; search?: string }): Promise<FDRInstrument[]> {
    try {
      const query = new URLSearchParams();
      if (params?.status && params.status !== 'ALL') query.set('status', params.status);
      if (params?.bank && params.bank !== 'ALL') query.set('bank', params.bank);
      if (params?.search) query.set('search', params.search);

      const res = await fetch(`${API_BASE}/instruments?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch instruments');
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[API] Fetch instruments failed, falling back to cached state:', err);
      throw err;
    }
  }

  public async getInstrumentById(id: string): Promise<FDRInstrument> {
    const res = await fetch(`${API_BASE}/instruments/${id}`);
    if (!res.ok) throw new Error(`Instrument ${id} not found`);
    const json = await res.json();
    return json.data;
  }

  public async createInstrument(instrument: FDRInstrument): Promise<FDRInstrument> {
    const res = await fetch(`${API_BASE}/instruments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(instrument)
    });
    if (!res.ok) throw new Error('Failed to create instrument on backend');
    const json = await res.json();
    return json.data;
  }

  public async updateInstrument(id: string, updates: Partial<FDRInstrument>): Promise<FDRInstrument> {
    const res = await fetch(`${API_BASE}/instruments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update instrument on backend');
    const json = await res.json();
    return json.data;
  }

  public async verifyInstrument(id: string, decision: 'APPROVED' | 'CORRECTION_REQUIRED', note?: string, reviewerName?: string, reviewerRole?: string): Promise<FDRInstrument> {
    const res = await fetch(`${API_BASE}/instruments/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, note, reviewerName, reviewerRole })
    });
    if (!res.ok) throw new Error('Failed to submit scrutiny decision to backend');
    const json = await res.json();
    return json.data;
  }

  public async reconcileInstrument(id: string, bankFact: any, dualTruth: any): Promise<FDRInstrument> {
    const res = await fetch(`${API_BASE}/instruments/${id}/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bankFact, dualTruth })
    });
    if (!res.ok) throw new Error('Failed to reconcile instrument with bank facts');
    const json = await res.json();
    return json.data;
  }

  public async renewInstrument(id: string, payload: {
    newRefNumber: string;
    newMaturityDate: string;
    newAmount: number;
    tenureYears: number;
    renewalDocumentName?: string;
  }): Promise<FDRInstrument> {
    const res = await fetch(`${API_BASE}/instruments/${id}/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to process renewal on backend');
    const json = await res.json();
    return json.data;
  }

  public async releaseInstrument(id: string, multiCellClearances: any): Promise<FDRInstrument> {
    const res = await fetch(`${API_BASE}/instruments/${id}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ multiCellClearances })
    });
    if (!res.ok) throw new Error('Failed to process release sanction on backend');
    const json = await res.json();
    return json.data;
  }

  // --- PC MEDIA UPLOAD ---

  public async uploadDocumentFromPC(
    file: File, 
    metadata?: { uploaderName?: string; uploaderRole?: string }
  ): Promise<UploadedMediaResponse> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      if (metadata?.uploaderName) formData.append('uploaderName', metadata.uploaderName);
      if (metadata?.uploaderRole) formData.append('uploaderRole', metadata.uploaderRole);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        if (json && json.success) {
          // If server returns local disk path, provide browser blob URL for instant preview
          const previewUrl = URL.createObjectURL(file);
          return {
            ...json,
            file: {
              ...json.file,
              url: previewUrl
            }
          };
        }
      }
    } catch (err) {
      console.warn('[API] Server upload endpoint unavailable or non-JSON, using client AI document analyzer:', err);
    }

    // 100% resilient client-side browser analysis fallback
    return await analyzeDocumentInBrowser(file, {
      uploaderName: metadata?.uploaderName
    });
  }

  // --- INSTITUTIONS ---

  public async getInstitutions(): Promise<Institution[]> {
    const res = await fetch(`${API_BASE}/institutions`);
    if (!res.ok) throw new Error('Failed to fetch institutions');
    const json = await res.json();
    return json.data;
  }

  // --- AUDIT LOGS & CRYPTOGRAPHIC LEDGER ---

  public async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit-logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    const json = await res.json();
    return json.data;
  }

  public async addAuditLog(entry: any): Promise<AuditLog> {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (!res.ok) throw new Error('Failed to record audit log on backend');
    const json = await res.json();
    return json.data;
  }

  public async getCryptoLedger(): Promise<{ blocks: CryptographicAuditBlock[]; verification: any }> {
    const res = await fetch(`${API_BASE}/crypto-ledger`);
    if (!res.ok) throw new Error('Failed to fetch crypto ledger');
    const json = await res.json();
    return { blocks: json.data, verification: json.verification };
  }

  public async tamperBlock(blockIndex: number, forgedDetails?: string): Promise<{ success: boolean; blocks: CryptographicAuditBlock[]; verification: any }> {
    const res = await fetch(`${API_BASE}/crypto-ledger/tamper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockIndex, forgedDetails })
    });
    const json = await res.json();
    return { success: json.success, blocks: json.data, verification: json.verification };
  }

  public async tamperCryptoLedger(blockIndex: number, forgedDetails?: string) {
    return this.tamperBlock(blockIndex, forgedDetails);
  }

  public async repairLedger(): Promise<{ success: boolean; blocks: CryptographicAuditBlock[]; verification: any }> {
    const res = await fetch(`${API_BASE}/crypto-ledger/repair`, {
      method: 'POST'
    });
    const json = await res.json();
    return { success: json.success, blocks: json.data, verification: json.verification };
  }

  public async repairCryptoLedger() {
    return this.repairLedger();
  }

  // --- NOTIFICATIONS ---

  public async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE}/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const json = await res.json();
    return json.data;
  }

  public async markNotificationRead(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/notifications/mark-read/${id}`, { method: 'POST' });
    const json = await res.json();
    return json.success;
  }

  public async markAllNotificationsRead(): Promise<boolean> {
    const res = await fetch(`${API_BASE}/notifications/mark-all-read`, { method: 'POST' });
    const json = await res.json();
    return json.success;
  }

  // --- CSV EXPORT ---

  public getExportCSVUrl(): string {
    return `${API_BASE}/analytics/export-csv`;
  }
}

export const api = new ApiClient();
