import { Router } from 'express';
import { runQuery } from '../db/driver.js';
import { BLAST_RADIUS_BY_PACKAGE, BLAST_RADIUS_BY_CVE, BLAST_RADIUS_GRAPH } from '../queries/blastRadius.js';

const router = Router();

// GET /api/blast-radius/cve/:cveId
router.get('/cve/:cveId', async (req, res, next) => {
  try {
    const records = await runQuery(BLAST_RADIUS_BY_CVE, { cveId: req.params.cveId });
    const affected = records.map(r => ({
      package: r.get('package'),
      description: r.get('description'),
      vulnerablePackage: r.get('vulnerablePackage'),
      hops: typeof r.get('hops')?.toNumber === 'function'
        ? r.get('hops').toNumber()
        : r.get('hops'),
      severity: r.get('severity'),
    }));

    return res.json({ cveId: req.params.cveId, affected });
  } catch (err) {
    next(err);
  }
});

// GET /api/blast-radius/:packageName
router.get('/:packageName', async (req, res, next) => {
  try {
    const { packageName } = req.params;

    const records = await runQuery(BLAST_RADIUS_BY_PACKAGE, { packageName });
    const affected = records.map(r => ({
      package: r.get('package'),
      description: r.get('description'),
      hops: typeof r.get('hops')?.toNumber === 'function'
        ? r.get('hops').toNumber()
        : r.get('hops'),
    }));

    const graphRecords = await runQuery(BLAST_RADIUS_GRAPH, { packageName });
    
    const nodeSet = new Set([packageName]);
    const links = [];

    graphRecords.forEach(r => {
      const chain = r.get('chain') || [];
      chain.forEach(name => nodeSet.add(name));
      
      for (let i = 0; i < chain.length - 1; i++) {
        links.push({ source: chain[i], target: chain[i + 1] });
      }
    });

    const nodes = Array.from(nodeSet).map(name => ({
      id: name,
      group: name === packageName ? 'vulnerable' : 'affected',
      hops: affected.find(a => a.package === name)?.hops || 0,
    }));

    const uniqueLinks = Array.from(
      new Map(links.map(l => [`${l.source}->${l.target}`, l])).values()
    );

    return res.json({
      vulnerablePackage: packageName,
      affectedCount: affected.length,
      affected,
      graph: { nodes, links: uniqueLinks },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
