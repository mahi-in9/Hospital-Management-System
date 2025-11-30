import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';
import { ValidationError } from '../utils/errors.js';
import { spawn } from 'child_process';
import { fileTypeFromFile } from 'file-type';

const MODELS_DIR = path.join(process.cwd(), 'public', 'models');

export const ensureModelsDir = () => {
  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
  }
};

const ALLOWED_EXT = new Set(['.glb', '.gltf']);
const ALLOWED_MIMES = new Set([
  'model/gltf-binary',
  'model/gltf+json',
  'application/octet-stream', // some uploads come through as octet-stream
]);

export const uploadModel = async (req, res) => {
  try {
    ensureModelsDir();

    if (!req.file) throw new ValidationError('No file uploaded');

    // Size validation
    const maxSize = config.MODEL_MAX_SIZE || 25 * 1024 * 1024;
    if (req.file.size > maxSize) {
      // remove temp file
      try { fs.unlinkSync(req.file.path); } catch (e) {}
      throw new ValidationError(`File too large. Max allowed is ${Math.round(maxSize / (1024 * 1024))} MB`);
    }

    // Extension/mime validation
    const originalExt = path.extname(req.file.originalname).toLowerCase() || '';
    const mime = (req.file.mimetype || '').toLowerCase();
    if (!ALLOWED_EXT.has(originalExt) && !ALLOWED_MIMES.has(mime)) {
      // we'll still attempt header sniffing below, but bail early for obvious mismatch
      try { fs.unlinkSync(req.file.path); } catch (e) {}
      throw new ValidationError('Invalid file type. Only .glb or .gltf files are allowed');
    }

    // Use file-type to detect binary file type reliably
    let detected;
    try {
      detected = await fileTypeFromFile(req.file.path);
    } catch (e) {
      detected = null;
    }

    const detectedExt = detected?.ext ? `.${detected.ext.toLowerCase()}` : '';
    const detectedMime = (detected?.mime || '').toLowerCase();

    // Accept if detected extension/mime is allowed
    if (detectedExt && ALLOWED_EXT.has(detectedExt)) {
      // ok
    } else if (detectedMime && ALLOWED_MIMES.has(detectedMime)) {
      // ok
    } else {
      // fallback: if file is small-ish, try JSON parse for .gltf
      const stats = fs.statSync(req.file.path);
      if (stats.size < 200 * 1024) {
        try {
          const content = fs.readFileSync(req.file.path, 'utf8');
          JSON.parse(content);
          // parsed as JSON -> accept as .gltf
        } catch (e) {
          try { fs.unlinkSync(req.file.path); } catch (ee) {}
          throw new ValidationError('Invalid file type. Only .glb or .gltf files are allowed');
        }
      } else {
        try { fs.unlinkSync(req.file.path); } catch (ee) {}
        throw new ValidationError('Invalid file type. Only .glb or .gltf files are allowed');
      }
    }

    // Optional async virus scan using ClamAV (if enabled)
    if (config.CLAMAV_ENABLED) {
      await new Promise((resolve, reject) => {
        const cmd = config.CLAMAV_CMD || 'clamscan';
        const args = ['--no-summary', req.file.path];
        const child = spawn(cmd, args);
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (c) => { stdout += c.toString(); });
        child.stderr.on('data', (c) => { stderr += c.toString(); });
        child.on('error', (err) => {
          logger.error(`ClamAV spawn error: ${err.message}`);
          try { fs.unlinkSync(req.file.path); } catch (e) {}
          return reject(new ValidationError('Virus scanning unavailable or failed'));
        });
        child.on('close', (code) => {
          if (code !== 0) {
            logger.error(`ClamAV scan failed: ${stderr || stdout}`);
            try { fs.unlinkSync(req.file.path); } catch (e) {}
            return reject(new ValidationError('File failed virus scan'));
          }
          return resolve();
        });
      });
    }

    const tenantId = req.tenant?.id || req.body.tenantId || req.query.tenantId;
    const roomId = req.body.roomId || req.body.id || req.body.name || null;

    // Build filename: prefer tenant-roomId.glb to avoid collisions
    const safeRoom = roomId ? String(roomId).replace(/[^a-zA-Z0-9-_.]/g, '_') : null;
    const filename = tenantId && safeRoom ? `${tenantId}-${safeRoom}${originalExt || '.glb'}` : req.file.originalname;

    const destPath = path.join(MODELS_DIR, filename);

    // move the uploaded temp file to destination
    fs.renameSync(req.file.path, destPath);

    const url = `${config.FRONTEND_URL.replace(/\/+$/g, '')}/models/${encodeURIComponent(filename)}`;

    logger.info(`Model uploaded: ${filename}`);
    res.json({ message: 'Model uploaded', data: { filename, url } });
  } catch (error) {
    logger.error(`Model upload error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const listModels = async (req, res) => {
  try {
    ensureModelsDir();
    const authTenant = req.tenant?.id || null;
    // allow query tenant override for admins/superusers when provided
    const queryTenant = req.query?.tenantId || null;
    const tenantId = queryTenant && !authTenant ? queryTenant : authTenant;

    const files = fs.readdirSync(MODELS_DIR);

    const all = files
      .filter((f) => {
        if (!tenantId) return true; // show all
        return f.startsWith(`${tenantId}-`);
      })
      .map((filename) => {
        const stat = fs.statSync(path.join(MODELS_DIR, filename));
        return {
          filename,
          url: `${config.FRONTEND_URL.replace(/\/+$/g, '')}/models/${encodeURIComponent(filename)}`,
          size: stat.size,
          mtime: stat.mtime,
        };
      });

    // pagination
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
    const total = all.length;
    const start = (page - 1) * limit;
    const items = all.slice(start, start + limit);

    res.json({ message: 'OK', data: { items, total, page, limit } });
  } catch (error) {
    logger.error(`List models error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const deleteModel = async (req, res) => {
  try {
    ensureModelsDir();
    const { filename } = req.params;
    if (!filename) return res.status(400).json({ message: 'filename required' });

    const tenantId = req.tenant?.id || null;
    // Prevent tenant from deleting other tenant's files
    if (tenantId && !filename.startsWith(`${tenantId}-`)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const filePath = path.join(MODELS_DIR, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Not found' });

    fs.unlinkSync(filePath);
    logger.info(`Model deleted: ${filename}`);
    res.json({ message: 'Deleted', data: { filename } });
  } catch (error) {
    logger.error(`Delete model error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export default { uploadModel, ensureModelsDir, listModels, deleteModel };
