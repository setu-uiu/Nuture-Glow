import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.resolve(__dirname, '..');

const uploadRoot =
  process.env.UPLOAD_DIR && process.env.UPLOAD_DIR.trim()
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(BACKEND_ROOT, 'uploads');

const DEFAULT_MAX_UPLOAD_MB = 5;
const maxUploadMb = Number(process.env.UPLOAD_MAX_MB || DEFAULT_MAX_UPLOAD_MB);
const maxUploadBytes =
  Number.isFinite(maxUploadMb) && maxUploadMb > 0
    ? Math.floor(maxUploadMb * 1024 * 1024)
    : DEFAULT_MAX_UPLOAD_MB * 1024 * 1024;

const avatarUploadDir = path.join(uploadRoot, 'avatars');
const verificationUploadDir = path.join(uploadRoot, 'verification-docs');

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]);

const DOCUMENT_MIME_TYPES = new Set([
  ...IMAGE_MIME_TYPES,
  'application/pdf'
]);

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir(uploadRoot);
ensureDir(avatarUploadDir);
ensureDir(verificationUploadDir);

const fallbackExtensionByMime = new Map([
  ['image/jpeg', '.jpg'],
  ['image/jpg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
  ['application/pdf', '.pdf']
]);

const getSafeExtension = (file) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (/^\.[a-z0-9]{1,8}$/.test(ext)) {
    return ext;
  }
  return fallbackExtensionByMime.get(file.mimetype) || '';
};

const createUploader = (targetDir, allowedMimeTypes) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, targetDir),
      filename: (req, file, cb) => {
        const ext = getSafeExtension(file);
        const filename = `${Date.now()}-${randomUUID()}${ext}`;
        cb(null, filename);
      }
    }),
    limits: {
      files: 1,
      fileSize: maxUploadBytes
    },
    fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.has(file.mimetype)) {
        const err = new Error('Unsupported file type');
        err.status = 400;
        cb(err, false);
        return;
      }
      cb(null, true);
    }
  });

const toPublicUploadPath = (relativePath) => {
  const normalized = String(relativePath || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');
  return `/uploads/${normalized}`;
};

const resolveBaseUrl = (req) => {
  const base = (process.env.PUBLIC_BASE_URL || '').trim();
  if (base) {
    return base.replace(/\/+$/, '');
  }
  return `${req.protocol}://${req.get('host')}`;
};

const buildPublicFileUrl = (req, relativePath) =>
  `${resolveBaseUrl(req)}${toPublicUploadPath(relativePath)}`;

const extractUploadRelativePath = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') {
    return null;
  }

  let pathname = fileUrl;
  try {
    pathname = new URL(fileUrl).pathname;
  } catch {
    // If it is already a path-like string, keep it as-is.
  }

  const normalized = pathname.replace(/\\/g, '/');
  const marker = '/uploads/';
  const idx = normalized.indexOf(marker);
  if (idx < 0) {
    return null;
  }

  const relativePath = normalized.slice(idx + marker.length).replace(/^\/+/, '');
  if (!relativePath || relativePath.includes('..')) {
    return null;
  }
  return relativePath;
};

const removeUploadFileByUrl = async (fileUrl) => {
  const relativePath = extractUploadRelativePath(fileUrl);
  if (!relativePath) {
    return false;
  }

  const absolutePath = path.resolve(uploadRoot, relativePath);
  const relativeToRoot = path.relative(uploadRoot, absolutePath);
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    return false;
  }

  try {
    await fsPromises.unlink(absolutePath);
    return true;
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
};

const avatarUpload = createUploader(avatarUploadDir, IMAGE_MIME_TYPES);
const verificationDocUpload = createUploader(verificationUploadDir, DOCUMENT_MIME_TYPES);

export {
  avatarUpload,
  buildPublicFileUrl,
  maxUploadBytes,
  removeUploadFileByUrl,
  uploadRoot,
  verificationDocUpload
};
