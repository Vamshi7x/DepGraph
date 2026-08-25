import neo4j from 'neo4j-driver';
import config from '../config/index.js';

const driver = neo4j.driver(
  config.neo4j.uri,
  neo4j.auth.basic(config.neo4j.user, config.neo4j.password),
  {
    maxConnectionLifetime: 30 * 60 * 1000,
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 10000,
  }
);

export function getSession(mode = 'READ') {
  return driver.session({
    defaultAccessMode: mode === 'WRITE' ? neo4j.session.WRITE : neo4j.session.READ,
  });
}

export async function runQuery(cypher, params = {}) {
  const session = getSession('READ');
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

export async function runWriteQuery(cypher, params = {}) {
  const session = getSession('WRITE');
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

export async function verifyConnectivity() {
  await driver.verifyConnectivity();
}

export async function closeDriver() {
  await driver.close();
}

process.on('SIGINT', async () => {
  try {
    await closeDriver();
  } catch (e) {}
  process.exit(0);
});

process.on('SIGTERM', async () => {
  try {
    await closeDriver();
  } catch (e) {}
  process.exit(0);
});

export default driver;
