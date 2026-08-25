import { Router } from 'express';
import { runQuery } from '../db/driver.js';
import { SHARED_DEPENDENCIES } from '../queries/sharedDeps.js';

const router = Router();

// GET /api/shared-deps?a=express&b=fastify
router.get('/', async (req, res, next) => {
  try {
    const { a, b } = req.query;

    if (!a || !b) {
      return res.status(400).json({ error: 'Both "a" and "b" query params are required' });
    }

    const records = await runQuery(SHARED_DEPENDENCIES, { pkgA: a, pkgB: b });
    const shared = records.map(r => ({
      name: r.get('name'),
      description: r.get('description'),
      version: r.get('version'),
    }));

    return res.json({
      packageA: a,
      packageB: b,
      sharedCount: shared.length,
      shared,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
