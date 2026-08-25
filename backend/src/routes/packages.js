import { Router } from 'express';
import { runQuery } from '../db/driver.js';
import { SEARCH_PACKAGES, GET_PACKAGE_DETAIL, GET_PACKAGE_GRAPH, LIST_ALL_PACKAGES } from '../queries/packages.js';

const router = Router();

// GET /api/packages?search=express
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    
    if (search && search.trim()) {
      const records = await runQuery(SEARCH_PACKAGES, { search: search.trim() });
      const packages = records.map(r => ({
        name: r.get('name'),
        ecosystem: r.get('ecosystem'),
        description: r.get('description'),
        latest_version: r.get('latest_version'),
        release_date: r.get('release_date'),
      }));
      return res.json({ packages });
    }

    // No search term — return top packages
    const records = await runQuery(LIST_ALL_PACKAGES);
    const packages = records.map(r => ({
      name: r.get('name'),
      ecosystem: r.get('ecosystem'),
      description: r.get('description'),
      latest_version: r.get('latest_version'),
      depCount: typeof r.get('depCount')?.toNumber === 'function' 
        ? r.get('depCount').toNumber() 
        : r.get('depCount'),
    }));
    return res.json({ packages });
  } catch (err) {
    next(err);
  }
});

// GET /api/packages/:name
router.get('/:name', async (req, res, next) => {
  try {
    const records = await runQuery(GET_PACKAGE_DETAIL, { name: req.params.name });
    
    if (records.length === 0) {
      return res.status(404).json({ error: `Package "${req.params.name}" not found` });
    }

    const r = records[0];
    const pkg = {
      name: r.get('name'),
      ecosystem: r.get('ecosystem'),
      description: r.get('description'),
      latest_version: r.get('latest_version'),
      versions: (r.get('versions') || []).filter(v => v.number),
      maintainers: (r.get('maintainers') || []).filter(Boolean),
      dependencies: (r.get('dependencies') || []).filter(Boolean),
      vulnerabilities: (r.get('vulnerabilities') || []).filter(v => v.cve_id),
    };

    return res.json({ package: pkg });
  } catch (err) {
    next(err);
  }
});

// GET /api/packages/:name/graph
router.get('/:name/graph', async (req, res, next) => {
  try {
    const records = await runQuery(GET_PACKAGE_GRAPH, { name: req.params.name });

    if (records.length === 0) {
      return res.status(404).json({ error: `Package "${req.params.name}" not found` });
    }

    const r = records[0];
    const source = r.get('source');
    const directDeps = r.get('directDeps') || [];
    const transitiveDeps = (r.get('transitiveDeps') || []).filter(d => d.to);

    const nodeSet = new Set([source, ...directDeps]);
    transitiveDeps.forEach(d => {
      nodeSet.add(d.from);
      if (d.to) nodeSet.add(d.to);
    });

    const nodes = Array.from(nodeSet).map(name => ({
      id: name,
      group: name === source ? 'root' : directDeps.includes(name) ? 'direct' : 'transitive',
    }));

    const links = [
      ...directDeps.map(dep => ({ source, target: dep, type: 'direct' })),
      ...transitiveDeps
        .filter(d => d.to)
        .map(d => ({ source: d.from, target: d.to, type: 'transitive' })),
    ];

    return res.json({ nodes, links });
  } catch (err) {
    next(err);
  }
});

export default router;
