import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Landmark, 
  ShieldCheck, 
  Calendar, 
  IndianRupee,
  ArrowRight,
  RefreshCw,
  Sparkles,
  HardDrive,
  FileCheck,
  ExternalLink,
  Laptop
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FDRInstrument, ExtractedOCRData, Institution } from '../types';
import { api } from '../lib/api';

interface FDRRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutions: Institution[];
  onAddInstrument: (instrument: FDRInstrument) => void;
}

export const FDRRegistrationModal: React.FC<FDRRegistrationModalProps> = ({
  isOpen,
  onClose,
  institutions,
  onAddInstrument
}) => {
  const [step, setStep] = useState<'upload' | 'ocr_review' | 'details'>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // PC Media file upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | undefined>(undefined);
  const [uploadedFileSize, setUploadedFileSize] = useState('2.4 MB');
  const [uploadedFileHash, setUploadedFileHash] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Form states
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(institutions[0]?.id || '');
  const [bankName, setBankName] = useState('State Bank of India');
  const [branchName, setBranchName] = useState('Connaught Place Branch, New Delhi');
  const [ifscCode, setIfscCode] = useState('SBIN0000691');
  const [referenceNumber, setReferenceNumber] = useState('SBI-FDR-2026-778901');
  const [amount, setAmount] = useState<number>(3500000);
  const [issueDate, setIssueDate] = useState('2026-10-24');
  const [maturityDate, setMaturityDate] = useState('2034-10-24');
  const [interestRate, setInterestRate] = useState<number>(7.15);
  const [tenureYears, setTenureYears] = useState<number>(8);
  const [purpose, setPurpose] = useState<FDRInstrument['purpose']>('New Institute Establishment');
  const [jointLienAICTE, setJointLienAICTE] = useState(true);
  const [autoRenewalClause, setAutoRenewalClause] = useState(true);
  const [uploadedFileName, setUploadedFileName] = useState('SBI_Deposit_Receipt_35L_Lien.pdf');

  // OCR simulation data
  const [extractedOCR, setExtractedOCR] = useState<ExtractedOCRData>({
    bankName: 'State Bank of India',
    referenceNumber: 'SBI-FDR-2026-778901',
    amount: 3500000,
    currency: 'INR',
    issueDate: '2026-10-24',
    maturityDate: '2034-10-24',
    interestRate: 7.15,
    jointLienAICTE: true,
    confidenceScore: 97,
    discrepancies: []
  });

  if (!isOpen) return null;

  // Preset sample templates for quick testing
  const sampleTemplates = [
    {
      name: 'SBI 8-Year Joint Lien (Compliant)',
      bank: 'State Bank of India',
      amount: 3500000,
      ref: 'SBI-FDR-2026-778901',
      jointLien: true,
      interest: 7.15,
      docName: 'SBI_35L_Compliant_JointLien.pdf'
    },
    {
      name: 'PNB 5-Year Expansion Deposit',
      bank: 'Punjab National Bank',
      amount: 1500000,
      ref: 'PNB-EXP-2026-554109',
      jointLien: true,
      interest: 7.05,
      docName: 'PNB_15L_TechCourse_FDR.pdf'
    },
    {
      name: 'HDFC Bank (Non-Compliant: Missing Lien)',
      bank: 'HDFC Bank Ltd',
      amount: 5000000,
      ref: 'HDFC-MGT-2026-339102',
      jointLien: false,
      interest: 7.30,
      docName: 'HDFC_50L_MissingJointLien.pdf'
    }
  ];

  const handleApplyTemplate = (tpl: typeof sampleTemplates[0]) => {
    setBankName(tpl.bank);
    setAmount(tpl.amount);
    setReferenceNumber(tpl.ref);
    setJointLienAICTE(tpl.jointLien);
    setInterestRate(tpl.interest);
    setUploadedFileName(tpl.docName);
    setUploadedFileUrl(undefined);

    setExtractedOCR({
      bankName: tpl.bank,
      referenceNumber: tpl.ref,
      amount: tpl.amount,
      currency: 'INR',
      issueDate,
      maturityDate,
      interestRate: tpl.interest,
      jointLienAICTE: tpl.jointLien,
      confidenceScore: tpl.jointLien ? 98 : 79,
      discrepancies: tpl.jointLien ? [] : ['Mandatory joint lien in favor of Member Secretary AICTE not found on document face.']
    });
  };

  // Upload file selected from PC Media
  const handleUploadPCFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setIsScanning(true);
      setScanProgress(25);

      const selectedInst = institutions.find(i => i.id === selectedInstitutionId) || institutions[0];
      const res = await api.uploadDocumentFromPC(file, {
        uploaderName: selectedInst?.name || 'Institution Signatory',
        uploaderRole: 'INSTITUTION'
      });

      setScanProgress(75);
      setTimeout(() => {
        setScanProgress(100);
        setIsScanning(false);
        setIsUploading(false);

        // Update form state with backend extracted data
        setUploadedFileName(res.file.originalName);
        setUploadedFileSize(res.file.sizeFormatted);
        setUploadedFileUrl(res.file.url);
        setUploadedFileHash(res.file.hash);

        const ocr = res.analysis.extractedOCR;
        setBankName(ocr.bankName);
        setReferenceNumber(ocr.referenceNumber);
        setAmount(ocr.amount);
        setIssueDate(ocr.issueDate);
        setMaturityDate(ocr.maturityDate);
        setJointLienAICTE(ocr.jointLienAICTE);
        setExtractedOCR(ocr);

        setStep('ocr_review');
      }, 400);
    } catch (err: any) {
      console.error('File upload failed:', err);
      setIsScanning(false);
      setIsUploading(false);
      setUploadError(err.message || 'Failed to upload file from PC media.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadPCFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadPCFile(e.dataTransfer.files[0]);
    }
  };

  const startOCRScan = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedInst = institutions.find(i => i.id === selectedInstitutionId) || institutions[0];

    const newInst: FDRInstrument = {
      id: `fdr-${Date.now()}`,
      referenceNumber,
      institutionId: selectedInst.id,
      institutionName: selectedInst.name,
      institutionCode: selectedInst.code,
      instrumentType: 'JOINT_FDR_AICTE',
      bankName,
      branchName,
      ifscCode,
      amount: Number(amount),
      currency: 'INR',
      issueDate,
      maturityDate,
      tenureYears: Number(tenureYears),
      interestRate: Number(interestRate),
      jointLienAICTE,
      autoRenewalClause,
      purpose,
      verificationStatus: jointLienAICTE ? 'PENDING' : 'DISCREPANCY_FLAGGED',
      workflowStatus: jointLienAICTE ? 'SUBMITTED' : 'DISCREPANCY_FLAGGED',
      documentName: uploadedFileName,
      documentSize: uploadedFileSize,
      documentType: uploadedFileName.toLowerCase().endsWith('.png') || uploadedFileName.toLowerCase().endsWith('.jpg') || uploadedFileName.toLowerCase().endsWith('.jpeg') ? 'IMAGE' : 'PDF',
      documentUrl: uploadedFileUrl,
      extractedData: {
        ...extractedOCR,
        rawTextDigest: uploadedFileHash ? `SHA256:${uploadedFileHash}` : undefined
      },
      reviewObservations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddInstrument(newInst);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {}

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001A99]/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Hidden Native File Input for PC Media Picker */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInputChange} 
        accept=".pdf,.png,.jpg,.jpeg,.webp" 
        className="hidden" 
      />

      <div className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-[12px_12px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden max-h-[92vh] flex flex-col text-slate-900">
        
        {/* Top Accent Strip */}
        <div className="h-3 w-full bg-[#CCFF00] border-b-2 border-black" />

        {/* Header */}
        <div className="px-8 py-5 border-b-2 border-black flex items-center justify-between bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0038FF] text-[#CCFF00] flex items-center justify-center font-bold border-2 border-black shadow-[3px_3px_0px_#000]">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black">
                REGISTER SECURITY DEPOSIT (FDR)
              </h2>
              <p className="text-xs text-black/70 font-bold mt-0.5">
                Statutory fixed deposit lodging & direct PC media upload pipeline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full text-black hover:bg-rose-500 hover:text-white border-2 border-transparent hover:border-black transition font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="px-8 py-3 bg-[#F8F9FA] border-b-2 border-black flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('upload')}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition border-2 ${
                step === 'upload' 
                  ? 'bg-[#0038FF] text-white border-black shadow-[3px_3px_0px_#000]' 
                  : 'bg-white text-black border-black/20 hover:border-black'
              }`}
            >
              1. Document Upload
            </button>
            <button
              onClick={() => setStep('ocr_review')}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition border-2 ${
                step === 'ocr_review' 
                  ? 'bg-[#0038FF] text-white border-black shadow-[3px_3px_0px_#000]' 
                  : 'bg-white text-black border-black/20 hover:border-black'
              }`}
            >
              2. Extracted Data
            </button>
            <button
              onClick={() => setStep('details')}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition border-2 ${
                step === 'details' 
                  ? 'bg-[#0038FF] text-white border-black shadow-[3px_3px_0px_#000]' 
                  : 'bg-white text-black border-black/20 hover:border-black'
              }`}
            >
              3. Regulatory Review
            </button>
          </div>

          {uploadedFileUrl && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#CCFF00] border-2 border-black rounded-full font-black text-[11px] shadow-[2px_2px_0px_#000]">
              <FileCheck className="w-3.5 h-3.5 text-black" />
              <span>PC File Linked</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-6">

              {/* Upload Drag Box from PC Media */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={startOCRScan}
                className={`p-8 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group ${
                  isDragging 
                    ? 'border-[#0038FF] bg-[#0038FF]/10 scale-[1.01]' 
                    : uploadedFileUrl
                    ? 'border-emerald-500 bg-emerald-50/40 hover:border-emerald-600'
                    : 'border-black bg-slate-50 hover:bg-[#CCFF00]/15 hover:border-[#0038FF]'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${
                  uploadedFileUrl ? 'bg-[#CCFF00] text-black' : 'bg-[#0038FF] text-[#CCFF00]'
                }`}>
                  {isUploading ? (
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  ) : uploadedFileUrl ? (
                    <FileCheck className="w-8 h-8 text-black" />
                  ) : (
                    <Laptop className="w-8 h-8" />
                  )}
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#CCFF00] border-2 border-black text-xs font-black uppercase tracking-wider mb-2 text-black shadow-[2px_2px_0px_#000]">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Direct PC Media Upload</span>
                </div>

                <h3 className="text-base md:text-lg font-black text-black">
                  {uploadedFileUrl ? 'Replace or Upload Another File from PC' : 'Choose Deposit Document from Your Computer'}
                </h3>
                
                <p className="text-xs text-slate-700 font-bold mt-1 max-w-md">
                  Drag & drop here or click to open your system file browser. Accepts official FDR receipt in <span className="text-[#0038FF]">.PDF, .PNG, .JPG</span> formats (up to 50MB).
                </p>

                {/* PC Browse Button */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startOCRScan();
                    }}
                    className="px-6 py-2.5 rounded-2xl bg-[#0038FF] hover:bg-[#002ecc] text-white border-2 border-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition"
                  >
                    <Laptop className="w-4 h-4 text-[#CCFF00]" />
                    <span>Browse Files on PC</span>
                  </button>

                  {uploadedFileUrl && (
                    <a
                      href={uploadedFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-black border-2 border-black font-black text-xs flex items-center gap-1.5 shadow-[3px_3px_0px_#000] transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#0038FF]" />
                      <span>View Uploaded File</span>
                    </a>
                  )}
                </div>

                {/* Active Upload Badge */}
                <div className="mt-4 px-4 py-2 rounded-2xl bg-white border-2 border-black text-xs font-mono font-bold text-black shadow-[3px_3px_0px_#000] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0038FF]" />
                  <span>{uploadedFileName}</span>
                  <span className="text-slate-500 text-[11px]">({uploadedFileSize})</span>
                </div>

                {uploadedFileHash && (
                  <div className="mt-2 text-[10px] font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
                    SHA-256: {uploadedFileHash.slice(0, 16)}...{uploadedFileHash.slice(-8)}
                  </div>
                )}
              </div>

              {/* Upload Error Alert */}
              {uploadError && (
                <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-900 text-xs font-bold flex items-center gap-3 shadow-[3px_3px_0px_rgba(225,29,72,0.4)]">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div className="flex-1">
                    <span>{uploadError}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={startOCRScan} 
                    className="px-3 py-1 bg-rose-600 text-white rounded-xl text-xs font-black border border-black hover:bg-rose-700"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Scanning / In-Progress Indicator */}
              {isScanning && (
                <div className="space-y-2 p-5 rounded-3xl bg-[#0038FF]/5 border-2 border-black shadow-[4px_4px_0px_#000] text-black">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-[#0038FF] animate-spin" />
                      <span>Uploading to Backend & Extracting OCR Forensics...</span>
                    </span>
                    <span className="font-mono text-[#0038FF]">{scanProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 border-2 border-black rounded-full h-3 overflow-hidden p-0.5">
                    <div 
                      className="bg-[#0038FF] h-full rounded-full transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Load Sample Presets */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-black text-black/60 uppercase tracking-wider block">
                  Or Quick Load Sample Bank Template:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sampleTemplates.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="p-3 text-left rounded-2xl border-2 border-black hover:border-[#0038FF] bg-white hover:bg-[#CCFF00]/20 transition text-xs space-y-1 shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      <span className="font-black text-black block leading-tight">{tpl.name}</span>
                      <span className="text-[11px] text-slate-700 font-bold block">₹{(tpl.amount / 100000).toFixed(0)} Lakhs • {tpl.bank}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep('ocr_review')}
                  className="px-6 py-3 rounded-2xl bg-[#0038FF] hover:bg-[#002ecc] text-white border-2 border-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition"
                >
                  <span>Review Extracted OCR Data</span>
                  <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: OCR REVIEW */}
          {step === 'ocr_review' && (
            <div className="space-y-6">
              
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Document Fields Extracted</span>
                    <span className="text-[11px] text-emerald-700/80">High confidence match from scheduled bank template</span>
                  </div>
                </div>
                <span className="font-mono font-bold bg-white px-2.5 py-1 rounded-full border border-emerald-200 text-emerald-700 shadow-2xs">
                  {extractedOCR.confidenceScore}% Score
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">FDR Reference / Account #</label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-teal-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Deposit Amount (₹ INR)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Maturity Date</label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              {/* Joint Lien Toggle */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Joint Lien Endorsement Clause</span>
                  <span className="text-[11px] text-slate-500">Explicit notation stating lien in favor of Member Secretary AICTE</span>
                </div>
                <input
                  type="checkbox"
                  checked={jointLienAICTE}
                  onChange={(e) => setJointLienAICTE(e.target.checked)}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
              </div>

              {/* PC Uploaded Document Link Preview */}
              {uploadedFileUrl && (
                <div className="p-4 rounded-2xl bg-[#CCFF00]/30 border-2 border-black flex items-center justify-between text-xs shadow-[3px_3px_0px_#000]">
                  <div className="flex items-center gap-2.5">
                    <Laptop className="w-5 h-5 text-[#0038FF]" />
                    <div>
                      <span className="font-black text-black block">PC File Attached: {uploadedFileName}</span>
                      <span className="text-slate-700 font-bold text-[11px]">{uploadedFileSize} • Stored on Live Backend</span>
                    </div>
                  </div>
                  <a
                    href={uploadedFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-[#0038FF] hover:bg-[#002ecc] text-white rounded-xl border border-black font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000] transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>View File</span>
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 text-black border-2 border-black rounded-2xl text-xs font-black uppercase tracking-wider transition shadow-[3px_3px_0px_#000]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-6 py-3 bg-[#0038FF] hover:bg-[#002ecc] text-white border-2 border-black rounded-2xl text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_#000] transition flex items-center gap-2"
                >
                  <span>Next: Institutional Details</span>
                  <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: DETAILS & CONFIRM */}
          {step === 'details' && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-black text-black">Lodging Institution</label>
                  <select
                    value={selectedInstitutionId}
                    onChange={(e) => setSelectedInstitutionId(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border-2 border-black rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0038FF] cursor-pointer shadow-[2px_2px_0px_#000]"
                  >
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-black">Branch Location</label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border-2 border-black rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0038FF] shadow-[2px_2px_0px_#000]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-black">IFSC Code</label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border-2 border-black rounded-xl px-3.5 py-2.5 text-xs font-mono font-black text-[#0038FF] focus:outline-none focus:border-[#0038FF] shadow-[2px_2px_0px_#000]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-black">Statutory Purpose</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as any)}
                    className="w-full bg-slate-50 focus:bg-white border-2 border-black rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0038FF] cursor-pointer shadow-[2px_2px_0px_#000]"
                  >
                    <option value="New Institute Establishment">New Institute Establishment (8 Years)</option>
                    <option value="New Technical Course Addition">New Technical Course Addition (5 Years)</option>
                    <option value="Intake Expansion">Intake Expansion</option>
                    <option value="Endowment Fund">Endowment Fund</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-black">Tenure (Years)</label>
                  <input
                    type="number"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-full bg-slate-50 focus:bg-white border-2 border-black rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0038FF] shadow-[2px_2px_0px_#000]"
                  />
                </div>
              </div>

              {/* PC Media Attachment Summary */}
              {uploadedFileUrl && (
                <div className="p-4 rounded-2xl bg-[#0038FF]/10 border-2 border-black flex items-center justify-between text-xs shadow-[3px_3px_0px_#000]">
                  <div className="flex items-center gap-2.5">
                    <Laptop className="w-5 h-5 text-[#0038FF]" />
                    <div>
                      <span className="font-black text-black block">Attached PC Media Dossier</span>
                      <span className="text-slate-600 font-bold text-[11px]">{uploadedFileName} ({uploadedFileSize})</span>
                    </div>
                  </div>
                  <a
                    href={uploadedFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black rounded-xl border border-black font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Preview Document</span>
                  </a>
                </div>
              )}

              {/* Disclaimer Notice */}
              <div className="p-4 rounded-2xl bg-[#CCFF00]/20 border-2 border-black text-xs text-black space-y-1 shadow-[3px_3px_0px_#000]">
                <span className="font-black flex items-center gap-1.5 text-black">
                  <ShieldCheck className="w-4 h-4 text-[#0038FF]" />
                  <span>Statutory Regulatory Declaration</span>
                </span>
                <p className="text-[11px] text-slate-800 font-bold leading-normal">
                  By lodging this security deposit, the institution certifies that the original FDR receipt is endorsed jointly with AICTE and kept in safe custody of the scheduled bank under Section 10(k) of the AICTE Act.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('ocr_review')}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 text-black border-2 border-black rounded-2xl text-xs font-black uppercase tracking-wider transition shadow-[3px_3px_0px_#000]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-7 py-3 bg-[#0038FF] hover:bg-[#002ecc] text-white border-2 border-black rounded-2xl text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_#000] transition flex items-center gap-2"
                >
                  <span>Submit & Lodge Deposit</span>
                  <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default FDRRegistrationModal;
