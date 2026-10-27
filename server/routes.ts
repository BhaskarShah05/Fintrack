import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { upload, processUploadedFile } from './upload';
import { FDRInstrument, UserRole } from '../src/types';

export const router = Router();

// --- 1. HEALTH CHECK ---
router.get('/health', (_req: Request, res: Response) => {
  const summary = db.getAnalyticsSummary();
  res.json({
    status: 'UP',
    name: 'AICTE KOSH-GUARD Financial Engine',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    metrics: {
      totalInstruments: summary.totalInstrumentsCount,
      totalDepositedINR: summary.totalDeposits,
      activeVerified: summary.activeVerifiedCount,
      discrepancies: summary.discrepanciesCount,
      cryptoBlocksCount: summary.auditBlocksCount
    }
  });
});

// --- 2. PC MEDIA UPLOAD ENDPOINT ---
router.post('/upload', upload.single('document'), (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file received from PC. Please select a valid document or scanned deposit instrument.' 
      });
    }

    const result = processUploadedFile(req.file);

    // Automatically record an audit log for document hashing
    db.addAuditLog({
      actorName: (req.body.uploaderName as string) || 'Institution Signatory',
      actorRole: (req.body.uploaderRole as UserRole) || 'INSTITUTION',
      action: 'MEDIA_DOCUMENT_UPLOADED',
      entityType: 'INSTRUMENT',
      entityId: req.file.filename,
      details: `Uploaded PC media "${req.file.originalname}" (${result.file.sizeFormatted}). Computed SHA-256: ${result.file.hash.slice(0, 16)}...`
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// --- 3. INSTRUMENTS CRUD ---

// Get all instruments with optional query filters
router.get('/instruments', (req: Request, res: Response) => {
  const { status, bank, institution, search } = req.query;
  const instruments = db.getInstruments({
    status: status as string,
    bank: bank as string,
    institution: institution as string,
    search: search as string
  });
  res.json({ success: true, count: instruments.length, data: instruments });
});

// Get single instrument
router.get('/instruments/:id', (req: Request, res: Response) => {
  const instrument = db.getInstrumentById(req.params.id);
  if (!instrument) {
    return res.status(404).json({ success: false, error: 'Deposit instrument not found.' });
  }
  res.json({ success: true, data: instrument });
});

// Create new instrument (lodgement)
router.post('/instruments', (req: Request, res: Response) => {
  const instrumentData = req.body as FDRInstrument;
  if (!instrumentData.institutionName || !instrumentData.amount) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required deposit fields: institutionName, amount, and referenceNumber are required.' 
    });
  }

  const created = db.createInstrument(instrumentData);
  res.status(201).json({ success: true, data: created });
});

// Update instrument
router.put('/instruments/:id', (req: Request, res: Response) => {
  const updated = db.updateInstrument(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Deposit instrument not found to update.' });
  }
  res.json({ success: true, data: updated });
});

// Delete instrument
router.delete('/instruments/:id', (req: Request, res: Response) => {
  const success = db.deleteInstrument(req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, error: 'Deposit instrument not found to delete.' });
  }
  res.json({ success: true, message: 'Instrument deleted successfully.' });
});

// Official Scrutiny Decision
router.post(['/instruments/:id/verify', '/instruments/:id/scrutiny'], (req: Request, res: Response) => {
  const { decision, note, reviewerName, reviewerRole } = req.body;
  const instrument = db.getInstrumentById(req.params.id);

  if (!instrument) {
    return res.status(404).json({ success: false, error: 'Instrument not found.' });
  }

  const isApproved = decision === 'APPROVED';
  const newWorkflowStatus = isApproved ? 'VERIFIED' : 'DISCREPANCY_FLAGGED';
  const newVerifStatus = isApproved ? 'VERIFIED' : 'DISCREPANCY_FLAGGED';

  const newObs = {
    id: `rev-${Date.now()}`,
    reviewerName: reviewerName || 'Er. Alok Nath (Regional Regulatory Officer)',
    reviewerRole: reviewerRole || 'OFFICIAL',
    status: newWorkflowStatus as any,
    comment: note || (isApproved ? 'Approved upon document scrutiny and joint lien verification.' : 'Discrepancy notice issued to institution.'),
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    decision: decision || 'APPROVED'
  };

  const updated = db.updateInstrument(instrument.id, {
    workflowStatus: newWorkflowStatus as any,
    verificationStatus: newVerifStatus as any,
    reviewObservations: [newObs, ...(instrument.reviewObservations || [])]
  });

  db.addAuditLog({
    actorName: reviewerName || 'Er. Alok Nath (Regional Regulatory Officer)',
    actorRole: (reviewerRole as UserRole) || 'OFFICIAL',
    action: 'REGULATORY_SCRUTINY_DECISION',
    entityType: 'INSTRUMENT',
    entityId: instrument.referenceNumber,
    details: `Official scrutiny completed for FDR #${instrument.referenceNumber}. Decision: ${decision}. Note: ${note || 'Standard approval'}`
  });

  res.json({ success: true, data: updated });
});

// Dual-Truth Bank Reconciliation
router.post('/instruments/:id/reconcile', (req: Request, res: Response) => {
  const { bankFact, dualTruth } = req.body;
  const instrument = db.getInstrumentById(req.params.id);

  if (!instrument) {
    return res.status(404).json({ success: false, error: 'Instrument not found.' });
  }

  const updated = db.updateInstrument(instrument.id, {
    bankFact: bankFact || instrument.bankFact,
    dualTruth: dualTruth || instrument.dualTruth,
    workflowStatus: dualTruth?.reconciliationState === 'VERIFIED' ? 'VERIFIED' : 'DISCREPANCY_FLAGGED'
  });

  db.addAuditLog({
    actorName: bankFact?.verifierName || 'SBI Nodal Verification Desk',
    actorRole: 'VERIFICATION_OFFICER',
    action: 'DUAL_TRUTH_RECONCILIATION_SYNC',
    entityType: 'INSTRUMENT',
    entityId: instrument.referenceNumber,
    details: `Direct bank API reconciliation recorded for FDR #${instrument.referenceNumber}. State: ${dualTruth?.reconciliationState || 'CONFIRMED'}`
  });

  res.json({ success: true, data: updated });
});

// Renewal Submission
router.post('/instruments/:id/renew', (req: Request, res: Response) => {
  const { newRefNumber, newMaturityDate, newAmount, tenureYears, renewalDocumentName } = req.body;
  const instrument = db.getInstrumentById(req.params.id);

  if (!instrument) {
    return res.status(404).json({ success: false, error: 'Instrument not found.' });
  }

  const updated = db.updateInstrument(instrument.id, {
    referenceNumber: newRefNumber || instrument.referenceNumber,
    maturityDate: newMaturityDate || instrument.maturityDate,
    amount: newAmount || instrument.amount,
    tenureYears: tenureYears || instrument.tenureYears,
    workflowStatus: 'VERIFIED',
    documentName: renewalDocumentName || instrument.documentName,
    renewalHistory: [
      {
        date: new Date().toISOString().slice(0, 10),
        reference: instrument.referenceNumber,
        amount: instrument.amount,
        renewalId: `ren-${Date.now()}`
      },
      ...(instrument.renewalHistory || [])
    ]
  });

  db.addAuditLog({
    actorName: 'Institution Signatory',
    actorRole: 'INSTITUTION',
    action: 'FDR_RENEWAL_COMPLETED',
    entityType: 'RENEWAL',
    entityId: newRefNumber || instrument.referenceNumber,
    details: `Executed renewal for FDR #${instrument.referenceNumber} → #${newRefNumber} (Maturity: ${newMaturityDate})`
  });

  res.json({ success: true, data: updated });
});

// Release Sanction Submission
router.post('/instruments/:id/release', (req: Request, res: Response) => {
  const { multiCellClearances } = req.body;
  const instrument = db.getInstrumentById(req.params.id);

  if (!instrument) {
    return res.status(404).json({ success: false, error: 'Instrument not found.' });
  }

  const updated = db.updateInstrument(instrument.id, {
    workflowStatus: 'RELEASED',
    multiCellClearances: multiCellClearances || instrument.multiCellClearances
  });

  db.addAuditLog({
    actorName: 'Prof. T. G. Sitharam (Supervisory Bureau Head)',
    actorRole: 'BUREAU_HEAD',
    action: 'STATUTORY_RELEASE_SANCTIONED',
    entityType: 'RELEASE_REQUEST',
    entityId: instrument.referenceNumber,
    details: `Final APH Clause 6.46 release sanction order sealed for ${instrument.institutionName} (₹${(instrument.amount / 100000).toFixed(1)} Lakhs). Joint lien encumbrance released.`
  });

  res.json({ success: true, data: updated });
});

// --- 4. INSTITUTIONS ---

router.get('/institutions', (_req: Request, res: Response) => {
  const institutions = db.getInstitutions();
  res.json({ success: true, count: institutions.length, data: institutions });
});

router.get('/institutions/:id', (req: Request, res: Response) => {
  const institution = db.getInstitutionById(req.params.id);
  if (!institution) {
    return res.status(404).json({ success: false, error: 'Institution not found.' });
  }
  const linkedInstruments = db.getInstruments({ institution: institution.id });
  res.json({ success: true, data: { ...institution, instruments: linkedInstruments } });
});

// --- 5. AUDIT LOGS & CRYPTOGRAPHIC LEDGER ---

router.get('/audit-logs', (_req: Request, res: Response) => {
  const logs = db.getAuditLogs();
  res.json({ success: true, count: logs.length, data: logs });
});

router.post('/audit-logs', (req: Request, res: Response) => {
  const log = db.addAuditLog(req.body);
  res.status(201).json({ success: true, data: log });
});

router.get('/crypto-ledger', (_req: Request, res: Response) => {
  const blocks = db.getCryptoBlocks();
  const verification = db.verifyCryptoLedger();
  res.json({ 
    success: true, 
    count: blocks.length, 
    data: blocks, 
    verification 
  });
});

router.post('/crypto-ledger/verify', (_req: Request, res: Response) => {
  const verification = db.verifyCryptoLedger();
  res.json({ success: true, data: verification });
});

// Simulates a row-level tamper attack to verify forensics detection
router.post('/crypto-ledger/tamper', (req: Request, res: Response) => {
  const { blockIndex } = req.body;
  const success = db.tamperCryptoBlock(Number(blockIndex ?? 1));
  res.json({ success, message: success ? `Block #${blockIndex ?? 1} tampered for forensic demonstration.` : 'Invalid block index.' });
});

// Restores cryptographic hash-chain integrity
router.post('/crypto-ledger/repair', (_req: Request, res: Response) => {
  const success = db.repairCryptoLedger();
  res.json({ success, message: 'Cryptographic ledger chain recomputed and verified.' });
});

// --- 6. NOTIFICATIONS ---

router.get('/notifications', (_req: Request, res: Response) => {
  const notifications = db.getNotifications();
  res.json({ success: true, count: notifications.length, data: notifications });
});

router.post('/notifications/mark-read/:id', (req: Request, res: Response) => {
  const success = db.markNotificationRead(req.params.id);
  res.json({ success });
});

router.post('/notifications/mark-all-read', (_req: Request, res: Response) => {
  db.markAllNotificationsRead();
  res.json({ success: true, message: 'All notifications marked as read.' });
});

// --- 7. ANALYTICS & EXPORTS ---

router.get('/analytics/summary', (_req: Request, res: Response) => {
  const summary = db.getAnalyticsSummary();
  res.json({ success: true, data: summary });
});

router.get('/analytics/export-csv', (_req: Request, res: Response) => {
  const csv = db.generateCSVExport();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=AICTE_KOSH_GUARD_Deposits_${Date.now()}.csv`);
  res.send(csv);
});

// --- 8. DATABASE RESET TO SEED STATE ---
router.post('/reset', (_req: Request, res: Response) => {
  db.resetDatabase();
  res.json({ success: true, message: 'Database reset to initial AICTE statutory seed state.' });
});
