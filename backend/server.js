import express from 'express';
import cors from 'cors';
import config from './src/config/index.js';
import { verifyConnectivity } from './src/db/driver.js';

// Route imports
import healthRouter from './src/routes/health.js';
import packagesRouter from './src/routes/packages.js';
import blastRadiusRouter from './src/routes/blastRadius.js';
import pathsRouter from './src/routes/paths.js';
import sharedDepsRouter from './src/routes/sharedDeps.js';
import cyclesRouter from './src/routes/cycles.js';
import statsRouter from './src/routes/stats.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRouter);
app.use('/api/packages', packagesRouter);
app.use('/api/blast-radius', blastRadiusRouter);
app.use('/api/path', pathsRouter);
app.use('/api/shared-deps', sharedDepsRouter);
app.use('/api/cycles', cyclesRouter);
app.use('/api/stats', statsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Neo4j-specific errors
  if (err.code === 'ServiceUnavailable' || err.code === 'SessionExpired') {
    return res.status(503).json({
      error: "Can't reach the database right now — please retry",
      code: 'DATABASE_UNAVAILABLE',
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
async function start() {
  try {
    console.log('🔌 Connecting to Neo4j...');
    await verifyConnectivity();
    console.log('✅ Neo4j connected');
  } catch (err) {
    console.warn('⚠️  Neo4j not reachable — server will start but queries will fail');
    console.warn(`   ${err.message}`);
  }

  app.listen(config.server.port, () => {
    console.log(`\n🚀 DepGraph API running at http://localhost:${config.server.port}`);
    console.log(`   Health: http://localhost:${config.server.port}/api/health\n`);
  });
}

start();
