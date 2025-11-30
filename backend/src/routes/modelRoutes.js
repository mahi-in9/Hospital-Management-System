import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadModel, listModels, deleteModel } from '../controllers/modelController.js';
import { config } from '../config/env.js';

const router = express.Router();

// Multer temp storage in OS temp dir
const upload = multer({ dest: path.join(process.cwd(), 'tmp', 'uploads') });

// List models (tenant-scoped)
router.get('/', listModels);

// Protected upload: requires tenant middleware in server mounting
router.post('/upload', upload.single('file'), uploadModel);

// Delete model by filename (tenant-scoped)
router.delete('/:filename', deleteModel);

// For development convenience, expose non-protected upload when not production
if (config.NODE_ENV !== 'production') {
  router.post('/dev-upload', upload.single('file'), uploadModel);
}

export default router;
