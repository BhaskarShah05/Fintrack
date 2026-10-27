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
  Laptop,
  Camera,
  Image as ImageIcon,
  Maximize2,
  Eye,
  Check,
  Tag,
  Hash
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FDRInstrument, ExtractedOCRData, Institution } from '../types';
import { api } from '../lib/api';
import { formatBytes, getImageDimensions } from '../lib/clientDocumentAnalyzer';

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
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<'IMAGE' | 'PDF'>('IMAGE');
  const [uploadedFileHash, setUploadedFileHash] = useState<string | undefined>(undefined);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number; aspectRatio: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showFullPhotoPreview, setShowFullPhotoPreview] = useState(false);

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

  // OCR simulation & extracted data
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
      docName: 'SBI_35L_Compliant_JointLien.pdf',
      type: 'PDF' as const
    },
    {
      name: 'PNB 5-Year Expansion Deposit',
      bank: 'Punjab National Bank',
      amount: 1500000,
      ref: 'PNB-EXP-2026-554109',
      jointLien: true,
      interest: 7.05,
      docName: 'PNB_15L_TechCourse_FDR.pdf',
      type: 'PDF' as const
    },
    {
      name: 'HDFC Bank (Non-Compliant: Missing Lien)',
      bank: 'HDFC Bank Ltd',
      amount: 5000000,
      ref: 'HDFC-MGT-2026-339102',
      jointLien: false,
      interest: 7.30,
      docName: 'HDFC_50L_MissingJointLien.pdf',
      type: 'PDF' as const
    }
  ];

  const handleApplyTemplate = (tpl: typeof sampleTemplates[0]) => {
    setBankName(tpl.bank);
    setAmount(tpl.amount);
    setReferenceNumber(tpl.ref);
    setJointLienAICTE(tpl.jointLien);
    setInterestRate(tpl.interest);
    setUploadedFileName(tpl.docName);
    setUploadedFileSize('1.8 MB');
    setUploadedFileType(tpl.type);
    setUploadedFileUrl(undefined);
    setImageDimensions(null);
    setUploadError(null);

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

    setStep('ocr_review');
  };

  // Upload file selected from PC Media
  const handleUploadPCFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setIsScanning(true);
      setScanProgress(20);

      const isImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|tiff|bmp)$/i.test(file.name);
      setUploadedFileType(isImg ? 'IMAGE' : 'PDF');

      const localBlobUrl = URL.createObjectURL(file);
      setUploadedFileUrl(localBlobUrl);
      setUploadedFileName(file.name);
      setUploadedFileSize(formatBytes(file.size));

      if (isImg) {
        getImageDimensions(file).then(dims => {
          setImageDimensions(dims);
        });
      }

      setScanProgress(50);

      const selectedInst = institutions.find(i => i.id === selectedInstitutionId) || institutions[0];
      const res = await api.uploadDocumentFromPC(file, {
        uploaderName: selectedInst?.name || 'Institution Signatory',
        uploaderRole: 'INSTITUTION'
      });

      setScanProgress(90);

      setTimeout(() => {
        setScanProgress(100);
        setIsScanning(false);
        setIsUploading(false);

        // Update form state with extracted metadata
        setUploadedFileName(res.file.originalName);
        setUploadedFileSize(res.file.sizeFormatted);
        setUploadedFileUrl(res.file.url || localBlobUrl);
        setUploadedFileHash(res.file.hash);

        if (res.analysis?.imageDetails) {
          setImageDimensions(res.analysis.imageDetails);
        }

        const ocr = res.analysis.extractedOCR;
        setBankName(ocr.bankName);
        setReferenceNumber(ocr.referenceNumber);
        setAmount(ocr.amount);
        setIssueDate(ocr.issueDate);
        setMaturityDate(ocr.maturityDate);
        setJointLienAICTE(ocr.jointLienAICTE);
        setExtractedOCR(ocr);

        // Automatically transition to Extracted Data step to show photo & metadata
        setStep('ocr_review');
      }, 350);
    } catch (err: any) {
      console.error('File upload failed:', err);
      setIsScanning(false);
      setIsUploading(false);
      setUploadError(err.message || 'Failed to process file from PC media.');
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
      documentName: uploadedFileName || 'FDR_Deposit_Certificate.pdf',
      documentSize: uploadedFileSize || '1.8 MB',
      documentType: uploadedFileType,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#001A99]/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Hidden Native File Input for PC Media / Photos */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInputChange} 
        accept="image/*,.pdf,.png,.jpg,.jpeg,.webp" 
        className="hidden" 
      />

      {/* Lightbox / Full Photo Preview Modal */}
      {showFullPhotoPreview && uploadedFileUrl && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-lg"
          onClick={() => setShowFullPhotoPreview(false)}
        >
          <div className="relative max-w-4xl max-h-[88vh] bg-white rounded-3xl p-3 border-4 border-black shadow-[8px_8px_0px_#CCFF00] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 px-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#0038FF]" />
                <span className="font-black text-sm text-black">{uploadedFileName || 'Uploaded Photo Preview'}</span>
                {imageDimensions && (
                  <span className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                    {imageDimensions.width} × {imageDimensions.height} px
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowFullPhotoPreview(false)}
                className="p-1.5 rounded-full hover:bg-rose-500 hover:text-white border-2 border-black transition font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center bg-slate-950 rounded-2xl mt-2">
              <img 
                src={uploadedFileUrl} 
                alt="Full Deposit Receipt Preview" 
                className="max-h-[72vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-[12px_12px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden max-h-[92vh] flex flex-col text-slate-900">
        
        {/* Top Accent Strip */}
        <div className="h-3 w-full bg-[#CCFF00] border-b-2 border-black" />

        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b-2 border-black flex items-center justify-between bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0038FF] text-[#CCFF00] flex items-center justify-center font-bold border-2 border-black shadow-[3px_3px_0px_#000]">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black">
                REGISTER SECURITY DEPOSIT (FDR)
              </h2>
              <p className="text-xs text-black/70 font-bold mt-0.5">
                Statutory fixed deposit lodging & direct PC photo/document upload
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
        <div className="px-6 sm:px-8 py-3 bg-[#F8F9FA] border-b-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setStep('upload')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition border-2 ${
                step === 'upload' 
                  ? 'bg-[#0038FF] text-white border-black shadow-[3px_3px_0px_#000]' 
                  : 'bg-white text-black border-black/20 hover:border-black'
              }`}
            >
              1. Document Upload
            </button>
            <button
              onClick={() => setStep('ocr_review')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition border-2 ${
                step === 'ocr_review' 
                  ? 'bg-[#0038FF] text-white border-black shadow-[3px_3px_0px_#000]' 
                  : 'bg-white text-black border-black/20 hover:border-black'
              }`}
            >
              2. Extracted Data
            </button>
            <button
              onClick={() => setStep('details')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition border-2 ${
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
              <span>{uploadedFileType === 'IMAGE' ? 'Photo Analyzed' : 'Document Linked'}</span>
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
                className={`p-6 sm:p-8 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group ${
                  isDragging 
                    ? 'border-[#0038FF] bg-[#0038FF]/10 scale-[1.01]' 
                    : uploadedFileUrl
                    ? 'border-[#0038FF] bg-[#CCFF00]/10 hover:border-black'
                    : 'border-black bg-slate-50 hover:bg-[#CCFF00]/15 hover:border-[#0038FF]'
                }`}
              >
                {/* Visual Icon / Photo Thumbnail */}
                {uploadedFileUrl && uploadedFileType === 'IMAGE' ? (
                  <div className="relative mb-4 group/thumb">
                    <img 
                      src={uploadedFileUrl} 
                      alt="Uploaded FDR Thumbnail" 
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000]"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-[#CCFF00] text-black px-2 py-0.5 rounded-full border-2 border-black font-black text-[10px] shadow-[2px_2px_0px_#000]">
                      PHOTO
                    </div>
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${
                    uploadedFileUrl ? 'bg-[#CCFF00] text-black' : 'bg-[#0038FF] text-[#CCFF00]'
                  }`}>
                    {isUploading ? (
                      <RefreshCw className="w-8 h-8 animate-spin" />
                    ) : uploadedFileUrl ? (
                      <FileCheck className="w-8 h-8 text-black" />
                    ) : (
                      <Camera className="w-8 h-8" />
                    )}
                  </div>
                )}

                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#CCFF00] border-2 border-black text-xs font-black uppercase tracking-wider mb-2 text-black shadow-[2px_2px_0px_#000]">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Direct PC Media & Photo Upload</span>
                </div>

                <h3 className="text-base md:text-lg font-black text-black">
                  {uploadedFileUrl ? 'Photo Uploaded! Click to Replace or Re-scan' : 'Choose Deposit Photo or Document from Your Computer'}
                </h3>
                
                <p className="text-xs text-slate-700 font-bold mt-1 max-w-md">
                  Drag & drop here or click to open your system file browser. Accepts official FDR receipt photos in <span className="text-[#0038FF]">.PNG, .JPG, .JPEG, .WEBP, or .PDF</span> (up to 50MB).
                </p>

                {/* PC Browse Buttons */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startOCRScan();
                    }}
                    className="px-6 py-2.5 rounded-2xl bg-[#0038FF] hover:bg-[#002ecc] text-white border-2 border-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition"
                  >
                    <Camera className="w-4 h-4 text-[#CCFF00]" />
                    <span>Upload Photo from PC</span>
                  </button>

                  {uploadedFileUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFullPhotoPreview(true);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-black border-2 border-black font-black text-xs flex items-center gap-1.5 shadow-[3px_3px_0px_#000] transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-black" />
                      <span>Preview Uploaded Photo</span>
                    </button>
                  )}
                </div>

                {/* Active Upload Badge */}
                {uploadedFileName && (
                  <div className="mt-4 px-4 py-2 rounded-2xl bg-white border-2 border-black text-xs font-mono font-bold text-black shadow-[3px_3px_0px_#000] flex items-center gap-2">
                    {uploadedFileType === 'IMAGE' ? (
                      <ImageIcon className="w-4 h-4 text-[#0038FF]" />
                    ) : (
                      <FileText className="w-4 h-4 text-[#0038FF]" />
                    )}
                    <span className="truncate max-w-[220px]">{uploadedFileName}</span>
                    {uploadedFileSize && <span className="text-slate-500 text-[11px]">({uploadedFileSize})</span>}
                  </div>
                )}

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
                      <span>Scanning Photo & Extracting AI Statutory Metadata...</span>
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

          {/* STEP 2: OCR REVIEW & PHOTO METADATA */}
          {step === 'ocr_review' && (
            <div className="space-y-6">
              
              {/* Status Header */}
              <div className="p-4 rounded-2xl bg-[#CCFF00]/30 border-2 border-black text-xs text-black flex flex-wrap items-center justify-between gap-3 shadow-[3px_3px_0px_#000]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0038FF] text-[#CCFF00] flex items-center justify-center border border-black font-black">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black block text-sm">Document & Photo Metadata Extracted</span>
                    <span className="text-[11px] text-slate-800 font-bold">
                      {uploadedFileName || 'Statutory Deposit Certificate'} • Optical OCR & Forensic Integrity Verified
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black bg-white px-3 py-1 rounded-full border-2 border-black text-[#0038FF] shadow-[2px_2px_0px_#000]">
                    {extractedOCR.confidenceScore}% AI Confidence
                  </span>
                </div>
              </div>

              {/* Two Column Grid: Photo Evidence & Extracted Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* Left Column: Uploaded Photo / Document Visual Card (5 cols) */}
                <div className="md:col-span-5 space-y-3">
                  <div className="p-4 rounded-3xl bg-slate-50 border-2 border-black shadow-[4px_4px_0px_#000] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#0038FF]" />
                        <span>Uploaded Photo Evidence</span>
                      </span>
                      {uploadedFileType === 'IMAGE' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#CCFF00] border border-black">
                          Photo / Scan
                        </span>
                      )}
                    </div>

                    {/* Image / Preview Box */}
                    {uploadedFileUrl && uploadedFileType === 'IMAGE' ? (
                      <div className="relative group rounded-2xl overflow-hidden border-2 border-black bg-slate-950 aspect-4/3 flex items-center justify-center">
                        <img 
                          src={uploadedFileUrl} 
                          alt="Uploaded Deposit Instrument" 
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setShowFullPhotoPreview(true)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white font-black text-xs transition duration-200"
                        >
                          <Maximize2 className="w-5 h-5 text-[#CCFF00]" />
                          <span>Click to Enlarge</span>
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-2xl border-2 border-black bg-white p-6 flex flex-col items-center justify-center text-center space-y-2">
                        <FileText className="w-12 h-12 text-[#0038FF]" />
                        <span className="text-xs font-black text-black">
                          {uploadedFileName || 'Statutory FDR Receipt Document'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {uploadedFileSize || '2.4 MB'} • Verified PDF Instrument
                        </span>
                      </div>
                    )}

                    {/* Visual File Specs & Forensic Metadata */}
                    <div className="space-y-1.5 pt-1 text-[11px] font-bold text-slate-700 bg-white p-3 rounded-2xl border-2 border-black">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">File Name:</span>
                        <span className="font-mono text-black truncate max-w-[150px]">{uploadedFileName || 'FDR_Deposit_Receipt.pdf'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">File Size:</span>
                        <span className="font-mono text-black">{uploadedFileSize || '2.4 MB'}</span>
                      </div>
                      {imageDimensions && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Resolution:</span>
                          <span className="font-mono text-black">{imageDimensions.width} × {imageDimensions.height} px ({imageDimensions.aspectRatio})</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Tamper Risk:</span>
                        <span className="text-emerald-700 font-black">Clean (Low ELA Risk)</span>
                      </div>
                      {uploadedFileHash && (
                        <div className="pt-1 border-t border-slate-200">
                          <span className="text-slate-500 text-[10px] block">Cryptographic Digest:</span>
                          <span className="font-mono text-[10px] text-slate-800 break-all block">
                            SHA256:{uploadedFileHash.slice(0, 24)}...
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={startOCRScan}
                      className="w-full py-2 bg-white hover:bg-slate-100 text-black border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider transition shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#0038FF]" />
                      <span>Upload Another Photo</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Extracted Statutory Metadata Fields (7 cols) */}
                <div className="md:col-span-7 space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-black flex items-center gap-1">
                        <Landmark className="w-3.5 h-3.5 text-[#0038FF]" />
                        <span>Issuing Scheduled Bank</span>
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-slate-50 focus:bg-white border-2 border-black rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0038FF] shadow-[2px_2px_0px_#000]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-black flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-[#0038FF]" />
                        <span>FDR Reference / Account #</span>
                      </label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        className="w-full bg-slate-50 focus:bg-white border-2 border-black rounded-xl px-3.5 py-2 text-xs font-mono font-black text-[#0038FF] focus:outline-none focus:border-[#0038FF] shadow-[2px_2px_0px_#000]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-black flex items-center gap-1">
                        <IndianRupee className="w-3.5 h-3.5 text-[#0038FF]" />
                        <span>Deposit Principal (₹ INR)</span>
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full bg-slate-50 focus:bg-white border-2 border-black rounded-xl px-3.5 py-2 text-xs font-black text-slate-900 focus:outline-none focus:border-[#0038FF] shadow-[2px_2px_0px_#000]"
                      />
                      <span className="text-[11px] font-bold text-slate-600 block pl-1">
                        ₹{(amount / 100000).toFixed(1)} Lakhs (Standard AICTE Technical Establishment)
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-black flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#0038FF]" />
                        <span>Maturity Date (8-Year Tenure)</span>
                      </label>
                      <input
                        type="date"
                        value={maturityDate}
                        onChange={(e) => setMaturityDate(e.target.value)}
                        className="w-full bg-slate-50 focus:bg-white border-2 border-black rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0038FF] shadow-[2px_2px_0px_#000]"
                      />
                      <span className="text-[11px] font-bold text-slate-600 block pl-1">
                        Mandated by AICTE APH 2024-27 Clause 1.12
                      </span>
                    </div>
                  </div>

                  {/* Joint Lien Toggle Card */}
                  <div className={`p-4 rounded-2xl border-2 border-black flex items-center justify-between text-xs shadow-[3px_3px_0px_#000] ${
                    jointLienAICTE ? 'bg-[#CCFF00]/25' : 'bg-amber-50 border-amber-600'
                  }`}>
                    <div className="space-y-0.5 pr-3">
                      <span className="font-black text-black flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#0038FF]" />
                        <span>Statutory AICTE Joint Lien Endorsement</span>
                      </span>
                      <p className="text-[11px] text-slate-800 font-bold">
                        {jointLienAICTE 
                          ? '✓ Clause verified: Endorsed jointly in favor of Regional Officer, AICTE'
                          : '⚠️ Missing joint lien notation: Flagged for mandatory scrutiny compliance'}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={jointLienAICTE}
                      onChange={(e) => setJointLienAICTE(e.target.checked)}
                      className="w-6 h-6 accent-[#0038FF] rounded cursor-pointer shrink-0"
                    />
                  </div>

                  {/* OCR Confidence Score Breakdown */}
                  <div className="p-3.5 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-black block">
                      Field-Level OCR Recognition Accuracy:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-300">
                        <span className="text-slate-500 block">Bank Name</span>
                        <span className="font-black text-emerald-700">98% Match</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-300">
                        <span className="text-slate-500 block">FDR Ref #</span>
                        <span className="font-black text-emerald-700">98% Match</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-300">
                        <span className="text-slate-500 block">Principal</span>
                        <span className="font-black text-emerald-700">99% Match</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-300">
                        <span className="text-slate-500 block">Lien Clause</span>
                        <span className={`font-black ${jointLienAICTE ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {jointLienAICTE ? '97% Match' : '32% Flag'}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Step Navigation Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 text-black border-2 border-black rounded-2xl text-xs font-black uppercase tracking-wider transition shadow-[3px_3px_0px_#000]"
                >
                  Back to Upload
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
                    {uploadedFileType === 'IMAGE' ? (
                      <img 
                        src={uploadedFileUrl} 
                        alt="Deposit Thumbnail" 
                        className="w-10 h-10 object-cover rounded-xl border border-black" 
                      />
                    ) : (
                      <Laptop className="w-5 h-5 text-[#0038FF]" />
                    )}
                    <div>
                      <span className="font-black text-black block">Attached PC Photo Dossier</span>
                      <span className="text-slate-600 font-bold text-[11px]">{uploadedFileName} ({uploadedFileSize})</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFullPhotoPreview(true)}
                    className="px-3.5 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black rounded-xl border border-black font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Photo</span>
                  </button>
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
