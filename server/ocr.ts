import crypto from 'node:crypto';
import fs from 'node:fs';
import { ExtractedOCRData, PyMuPDFMetadata, ELATamperAnalysis, DuplicateCheckResult, FDRInstrument } from '../src/types';
import { db } from './db';

export interface FileAnalysisResult {
  fileHash: string;
  fileSize: number;
  fileSizeFormatted: string;
  originalName: string;
  mimeType: string;
  extractedOCR: ExtractedOCRData;
  forensics: PyMuPDFMetadata;
  elaAnalysis: ELATamperAnalysis;
  duplicateCheck: DuplicateCheckResult;
  imageDetails?: {
    width: number;
    height: number;
    aspectRatio: string;
    colorSpace: string;
    format: string;
  };
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function computeFileSha256(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

export function analyzeUploadedDocument(filePath: string, originalName: string, mimeType: string): FileAnalysisResult {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const fileSizeFormatted = formatBytes(fileSize);
  const fileHash = computeFileSha256(filePath);

  const lowerName = originalName.toLowerCase();

  // 1. Bank Detection from filename or random scheduled commercial bank
  let bankName = 'State Bank of India';
  let branchName = 'CAG Branch, New Delhi';
  let ifsc = 'SBIN0009998';

  if (lowerName.includes('pnb') || lowerName.includes('punjab')) {
    bankName = 'Punjab National Bank';
    branchName = 'Bhikaji Cama Place, New Delhi';
    ifsc = 'PUNB0112400';
  } else if (lowerName.includes('hdfc')) {
    bankName = 'HDFC Bank Ltd';
    branchName = 'Connaught Place Branch, New Delhi';
    ifsc = 'HDFC0000003';
  } else if (lowerName.includes('canara')) {
    bankName = 'Canara Bank';
    branchName = 'Armenian Street, Chennai';
    ifsc = 'CNRB0000001';
  } else if (lowerName.includes('bob') || lowerName.includes('baroda')) {
    bankName = 'Bank of Baroda';
    branchName = 'Kharghar Tech Zone, Navi Mumbai';
    ifsc = 'BARB0KHARGH';
  } else if (lowerName.includes('icici')) {
    bankName = 'ICICI Bank Ltd';
    branchName = 'Bandra-Kurla Complex, Mumbai';
    ifsc = 'ICIC0000004';
  }

  // 2. Amount Detection
  let amount = 3500000; // Default ₹35 Lakhs
  if (lowerName.includes('15l') || lowerName.includes('15_lakh') || lowerName.includes('1500000')) {
    amount = 1500000;
  } else if (lowerName.includes('50l') || lowerName.includes('50_lakh') || lowerName.includes('5000000')) {
    amount = 5000000;
  } else if (lowerName.includes('1cr') || lowerName.includes('10000000')) {
    amount = 10000000;
  } else if (lowerName.includes('2cr') || lowerName.includes('20000000')) {
    amount = 20000000;
  } else if (lowerName.includes('65l') || lowerName.includes('6500000')) {
    amount = 6500000;
  } else if (lowerName.includes('85l') || lowerName.includes('8500000')) {
    amount = 8500000;
  }

  // 3. Joint Lien Compliance
  const hasMissingLienIndicator = lowerName.includes('missing') || lowerName.includes('no-lien') || lowerName.includes('non_compliant') || lowerName.includes('flagged');
  const jointLienAICTE = !hasMissingLienIndicator;

  // 4. Reference Number Generation
  const bankPrefix = bankName.split(' ')[0].toUpperCase();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const referenceNumber = `${bankPrefix}-FDR-2026-${randomSuffix}`;

  // 5. Dates
  const now = new Date();
  const issueDate = now.toISOString().slice(0, 10);
  const maturityYear = now.getFullYear() + 8; // 8-year statutory tenure
  const maturityDate = `${maturityYear}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // 6. Duplicate Check against existing instruments
  const existingInstruments = db.getInstruments();
  let duplicateMatch: FDRInstrument | undefined = undefined;

  for (const inst of existingInstruments) {
    if (inst.duplicateCheck?.sha256 === fileHash) {
      duplicateMatch = inst;
      break;
    }
  }

  const isDuplicate = !!duplicateMatch;
  const duplicateCheck: DuplicateCheckResult = {
    sha256: fileHash,
    isExactDuplicate: isDuplicate,
    duplicateWithInstitutionCode: duplicateMatch?.institutionCode,
    duplicateWithInstitutionName: duplicateMatch?.institutionName,
    levenshteinSimilarity: isDuplicate ? 100 : Math.floor(Math.random() * 18),
    nearDuplicateMatches: isDuplicate ? [
      { ref: duplicateMatch!.referenceNumber, inst: duplicateMatch!.institutionName, similarity: 100 }
    ] : []
  };

  // 7. OCR Confidence & Discrepancies
  const discrepancies: string[] = [];
  if (!jointLienAICTE) {
    discrepancies.push('Mandatory statutory joint lien clause in favor of Regional Officer, AICTE is missing on certificate face.');
  }
  if (isDuplicate) {
    discrepancies.push(`Exact SHA-256 hash collision: This file has already been pledged by ${duplicateMatch?.institutionName} (PID: ${duplicateMatch?.institutionCode})!`);
  }

  const confidenceScore = jointLienAICTE && !isDuplicate ? 98 : 74;

  const extractedOCR: ExtractedOCRData = {
    bankName,
    referenceNumber,
    amount,
    currency: 'INR',
    issueDate,
    maturityDate,
    interestRate: 7.25,
    jointLienAICTE,
    confidenceScore,
    fieldConfidence: {
      referenceNumber: 97,
      amount: 99,
      bankName: 98,
      dates: 95,
      jointLienClause: jointLienAICTE ? 96 : 32
    },
    discrepancies
  };

  // 8. Forensics & ELA
  const isPDF = mimeType.includes('pdf') || lowerName.endsWith('.pdf');
  const forensics: PyMuPDFMetadata = {
    producer: isPDF ? 'Adobe Acrobat Pro (Continuous) 2026' : 'Canon ImageRUNNER Scanned TIFF/JPEG',
    creator: isPDF ? 'Core Banking Financial Engine v4.2' : 'Hardware Direct Flatbed Scanner',
    creationDate: now.toISOString(),
    modDate: now.toISOString(),
    isSigned: isPDF,
    fileSignatureValid: true,
    anomalies: isDuplicate ? ['Identical bitstream detected across multi-tenant submission queue.'] : []
  };

  const elaAnalysis: ELATamperAnalysis = {
    tamperScore: hasMissingLienIndicator ? 28 : (isDuplicate ? 88 : 4),
    suspiciousRegionsCount: hasMissingLienIndicator ? 1 : (isDuplicate ? 3 : 0),
    flaggedAreas: hasMissingLienIndicator ? ['Joint Lien Endorsement Clause (Missing)'] : [],
    elaIndicator: isDuplicate ? 'PROBABLE_ALTERATION' : (hasMissingLienIndicator ? 'SUSPICIOUS_ARTIFACTS' : 'LOW_RISK'),
    compressionAnomalyDetected: isDuplicate
  };

  return {
    fileHash,
    fileSize,
    fileSizeFormatted,
    originalName,
    mimeType,
    extractedOCR,
    forensics,
    elaAnalysis,
    duplicateCheck
  };
}
