import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { analyzeUploadedDocument, FileAnalysisResult } from './ocr';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    // Sanitize filename to alphanumeric and dots/dashes
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${sanitizedName}`);
  }
});

// File filter for documents and scanned media
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.tiff', '.csv', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext) || file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Please upload a PDF, PNG, JPEG, or scanned deposit instrument.`));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for high-res scanned PDFs
  },
  fileFilter
});

export interface UploadedMediaResponse {
  success: boolean;
  file: {
    originalName: string;
    filename: string;
    mimeType: string;
    size: number;
    sizeFormatted: string;
    url: string;
    hash: string;
  };
  analysis: FileAnalysisResult;
}

export function processUploadedFile(file: Express.Multer.File): UploadedMediaResponse {
  const analysis = analyzeUploadedDocument(file.path, file.originalname, file.mimetype);

  return {
    success: true,
    file: {
      originalName: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      sizeFormatted: analysis.fileSizeFormatted,
      url: `/uploads/${file.filename}`,
      hash: analysis.fileHash
    },
    analysis
  };
}
