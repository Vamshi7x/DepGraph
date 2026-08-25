import { Router } from 'express';
import { runQuery } from '../db/driver.js';
import { DETECT_CYCLES } from '../queries/cycles.js';

const router = Router();

// GET /api/cycles
router.get('/', async (req, res, next) => {
  try {
    const records = await runQuery(DETECT_CYCLES);
    const cycles = records.map(r => r.get('cycle'));

    return res.json({
      found: cycles.length > 0,
      count: cycles.length,
      cycles,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
