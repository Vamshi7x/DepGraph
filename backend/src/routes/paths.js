import { Router } from 'express';
import { runQuery } from '../db/driver.js';
import { SHORTEST_PATH, ALL_SHORT_PATHS } from '../queries/paths.js';

const router = Router();

// GET /api/path?from=express&to=qs
router.get('/', async (req, res, next) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'Both "from" and "to" query params are required' });
    }

    const records = await runQuery(ALL_SHORT_PATHS, { from, to });

    if (records.length === 0) {
      return res.json({
        from,
        to,
        found: false,
        paths: [],
        message: `No dependency path found between "${from}" and "${to}"`,
      });
    }

    const paths = records.map(r => ({
      chain: r.get('chain'),
      hops: typeof r.get('totalHops')?.toNumber === 'function'
        ? r.get('totalHops').toNumber()
        : r.get('totalHops'),
    }));

    return res.json({
      from,
      to,
      found: true,
      paths,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
