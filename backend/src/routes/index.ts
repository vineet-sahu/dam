import express from 'express';
import authRoutes from './auth.routes';
import assetRoutes from './asset.routes';
import shareRoutes from './share.routes';
import adminRoutes from './admin.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/assets', assetRoutes);

router.use('/', shareRoutes);

router.use('/admin', adminRoutes);

export default router;
