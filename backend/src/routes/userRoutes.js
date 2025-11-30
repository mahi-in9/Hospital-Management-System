import express from 'express';
import { listPendingUsers, approveUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/pending', listPendingUsers);
router.post('/approve', approveUser);

export default router;
