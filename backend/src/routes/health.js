import { Router } from 'express';
import { verifyConnectivity } from '../db/driver.js';

const router = Router();

// GET /api/health
router.get('/', async (req, res) => {
  try {
    await verifyConnectivity();
    return res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    return res.status(503).json({
      status: 'error',
      database: 'unreachable',
      message: "Can't reach the database right now — please retry",
    });
  }
});

export default router;
