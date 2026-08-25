import { Router } from 'express';
import { runQuery } from '../db/driver.js';
import { MOST_DEPENDED_ON, MAINTAINER_RISK, ECOSYSTEM_OVERVIEW } from '../queries/stats.js';

const router = Router();

// GET /api/stats/overview
router.get('/overview', async (req, res, next) => {
  try {
    const records = await runQuery(ECOSYSTEM_OVERVIEW);
    const r = records[0];
    return res.json({
      packageCount: typeof r.get('packageCount')?.toNumber === 'function'
        ? r.get('packageCount').toNumber() : r.get('packageCount'),
      versionCount: typeof r.get('versionCount')?.toNumber === 'function'
        ? r.get('versionCount').toNumber() : r.get('versionCount'),
      maintainerCount: typeof r.get('maintainerCount')?.toNumber === 'function'
        ? r.get('maintainerCount').toNumber() : r.get('maintainerCount'),
      vulnerabilityCount: typeof r.get('vulnerabilityCount')?.toNumber === 'function'
        ? r.get('vulnerabilityCount').toNumber() : r.get('vulnerabilityCount'),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/stats/most-depended
router.get('/most-depended', async (req, res, next) => {
  try {
    const records = await runQuery(MOST_DEPENDED_ON);
    const packages = records.map(r => ({
      name: r.get('name'),
      description: r.get('description'),
      version: r.get('version'),
      dependentCount: typeof r.get('dependentCount')?.toNumber === 'function'
        ? r.get('dependentCount').toNumber() : r.get('dependentCount'),
    }));
    return res.json({ packages });
  } catch (err) {
    next(err);
  }
});

// GET /api/stats/maintainer-risk
router.get('/maintainer-risk', async (req, res, next) => {
  try {
    const records = await runQuery(MAINTAINER_RISK);
    const maintainers = records.map(r => ({
      maintainer: r.get('maintainer'),
      packages: r.get('packages'),
      totalDependents: typeof r.get('totalDependents')?.toNumber === 'function'
        ? r.get('totalDependents').toNumber() : r.get('totalDependents'),
    }));
    return res.json({ maintainers });
  } catch (err) {
    next(err);
  }
});

export default router;
