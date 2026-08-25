/**
 * seed.js — Fetches real npm package data and loads it into Neo4j/CognoDB.
 *
 * Usage: node scripts/seed.js
 *
 * This script:
 * 1. Uses a curated list of ~50 popular npm packages
 * 2. Fetches metadata from the public npm registry
 * 3. Extracts: name, description, latest version, dependencies, maintainers
 * 4. Generates synthetic vulnerability data for demo
 * 5. Loads everything via parameterized Cypher UNWIND batches
 */

import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
dotenv.config();

const BOLT_URI = process.env.BOLT_URI || 'bolt://localhost:7687';
const BOLT_USER = process.env.BOLT_USER || 'neo4j';
const BOLT_PASSWORD = process.env.BOLT_PASSWORD || 'password';

// ── Curated package list ────────────────────────────────────────────────────
const SEED_PACKAGES = [
  'express', 'react', 'react-dom', 'lodash', 'axios', 'webpack',
  'next', 'typescript', 'vue', 'angular', 'svelte', 'chalk',
  'commander', 'inquirer', 'glob', 'rimraf', 'mkdirp', 'minimist',
  'yargs', 'debug', 'dotenv', 'cors', 'body-parser', 'cookie-parser',
  'morgan', 'helmet', 'jsonwebtoken', 'bcrypt', 'uuid', 'moment',
  'dayjs', 'date-fns', 'underscore', 'async', 'bluebird', 'rxjs',
  'graphql', 'socket.io', 'mongoose', 'sequelize', 'knex', 'pg',
  'mysql2', 'redis', 'ioredis', 'nodemailer', 'jest', 'mocha',
  'chai', 'eslint', 'prettier', 'babel-core', 'postcss', 'autoprefixer',
  'sass', 'less', 'pug', 'ejs', 'handlebars', 'marked', 'highlight.js',
];

// ── Synthetic vulnerability data ────────────────────────────────────────────
const SYNTHETIC_VULNS = [
  { cve_id: 'CVE-2024-1001', severity: 'CRITICAL', description: 'Remote code execution via crafted request payload', published_date: '2024-03-15' },
  { cve_id: 'CVE-2024-1042', severity: 'HIGH', description: 'Prototype pollution allowing property injection', published_date: '2024-04-22' },
  { cve_id: 'CVE-2024-1103', severity: 'HIGH', description: 'Directory traversal in file serving middleware', published_date: '2024-05-10' },
  { cve_id: 'CVE-2024-1234', severity: 'MEDIUM', description: 'Cross-site scripting via unsanitized template output', published_date: '2024-06-01' },
  { cve_id: 'CVE-2024-1345', severity: 'MEDIUM', description: 'Denial of service through malformed regular expression', published_date: '2024-06-18' },
  { cve_id: 'CVE-2024-1456', severity: 'LOW', description: 'Information disclosure in error messages', published_date: '2024-07-05' },
  { cve_id: 'CVE-2024-1567', severity: 'CRITICAL', description: 'SQL injection via unparameterized query builder', published_date: '2024-07-20' },
  { cve_id: 'CVE-2024-1678', severity: 'HIGH', description: 'Authentication bypass in session middleware', published_date: '2024-08-02' },
  { cve_id: 'CVE-2024-1789', severity: 'MEDIUM', description: 'Memory leak under sustained concurrent connections', published_date: '2024-08-15' },
  { cve_id: 'CVE-2024-1890', severity: 'LOW', description: 'Verbose stack traces exposed in production mode', published_date: '2024-09-01' },
];

// Assign vulnerabilities to random packages for demo
const VULN_ASSIGNMENTS = [
  { cve_id: 'CVE-2024-1001', packages: ['express', 'body-parser'] },
  { cve_id: 'CVE-2024-1042', packages: ['lodash', 'underscore'] },
  { cve_id: 'CVE-2024-1103', packages: ['express'] },
  { cve_id: 'CVE-2024-1234', packages: ['ejs', 'pug', 'handlebars'] },
  { cve_id: 'CVE-2024-1345', packages: ['minimist'] },
  { cve_id: 'CVE-2024-1456', packages: ['debug'] },
  { cve_id: 'CVE-2024-1567', packages: ['sequelize', 'knex'] },
  { cve_id: 'CVE-2024-1678', packages: ['jsonwebtoken', 'helmet'] },
  { cve_id: 'CVE-2024-1789', packages: ['socket.io'] },
  { cve_id: 'CVE-2024-1890', packages: ['morgan'] },
];

// ── Fetch package metadata from npm ─────────────────────────────────────────
async function fetchPackageData(packageName) {
  try {
    const res = await fetch(`https://registry.npmjs.org/${packageName}`);
    if (!res.ok) {
      console.warn(`  ⚠️  Failed to fetch ${packageName}: ${res.status}`);
      return null;
    }
    const data = await res.json();
    const latestVersion = data['dist-tags']?.latest;
    const versionData = latestVersion ? data.versions?.[latestVersion] : null;

    return {
      name: data.name,
      description: (data.description || '').slice(0, 200),
      ecosystem: 'npm',
      latest_version: latestVersion || '0.0.0',
      release_date: data.time?.[latestVersion] || null,
      dependencies: versionData?.dependencies ? Object.keys(versionData.dependencies) : [],
      maintainers: (data.maintainers || []).map(m => ({
        username: m.name || m.email?.split('@')[0] || 'unknown',
        email: m.email || '',
      })),
    };
  } catch (err) {
    console.warn(`  ⚠️  Error fetching ${packageName}: ${err.message}`);
    return null;
  }
}

// ── Load data into Neo4j ────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 DepGraph Seed Script');
  console.log('='.repeat(50));

  // ── Step 1: Fetch all package data ──────────────────────────────────
  console.log(`\n📦 Fetching ${SEED_PACKAGES.length} packages from npm registry...\n`);
  const allPackages = [];
  const allDependencyNames = new Set();

  for (const name of SEED_PACKAGES) {
    process.stdout.write(`  Fetching ${name}...`);
    const data = await fetchPackageData(name);
    if (data) {
      allPackages.push(data);
      data.dependencies.forEach(d => allDependencyNames.add(d));
      console.log(` ✓ (${data.dependencies.length} deps)`);
    } else {
      console.log(' ✗');
    }
  }

  // Fetch transitive dependencies that aren't in our seed list
  const missingDeps = [...allDependencyNames].filter(
    d => !SEED_PACKAGES.includes(d) && !allPackages.find(p => p.name === d)
  );

  console.log(`\n📦 Fetching ${missingDeps.length} transitive dependencies...\n`);
  for (const name of missingDeps.slice(0, 60)) { // Cap at 60 extra for fast seeding
    process.stdout.write(`  Fetching ${name}...`);
    const data = await fetchPackageData(name);
    if (data) {
      allPackages.push(data);
      console.log(` ✓`);
    } else {
      console.log(' ✗');
    }
  }

  // ── Step 2: Connect to Neo4j and write ─────────────────────────────
  console.log('\n🔌 Connecting to Neo4j...');
  const driver = neo4j.driver(BOLT_URI, neo4j.auth.basic(BOLT_USER, BOLT_PASSWORD));

  try {
    await driver.verifyConnectivity();
    console.log('✅ Connected to Neo4j\n');
  } catch (err) {
    console.error('❌ Cannot connect to Neo4j:', err.message);
    console.error('   Make sure Neo4j is running and .env is configured correctly.');
    process.exit(1);
  }

  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE });

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await session.run('MATCH (n) DETACH DELETE n');

    // Create indexes
    console.log('📇 Creating indexes...');
    await session.run('CREATE INDEX pkg_name IF NOT EXISTS FOR (p:Package) ON (p.name)');
    await session.run('CREATE INDEX ver_number IF NOT EXISTS FOR (v:Version) ON (v.number)');
    await session.run('CREATE INDEX maint_username IF NOT EXISTS FOR (m:Maintainer) ON (m.username)');
    await session.run('CREATE INDEX vuln_cve IF NOT EXISTS FOR (v:Vulnerability) ON (v.cve_id)');

    // ── Step 3: Create Package nodes ────────────────────────────────────
    console.log(`\n📝 Creating ${allPackages.length} Package nodes...`);
    await session.run(
      `UNWIND $packages AS pkg
       MERGE (p:Package {name: pkg.name})
       SET p.ecosystem = pkg.ecosystem,
           p.description = pkg.description,
           p.latest_version = pkg.latest_version`,
      {
        packages: allPackages.map(p => ({
          name: p.name,
          ecosystem: p.ecosystem,
          description: p.description,
          latest_version: p.latest_version,
        })),
      }
    );

    // Also create placeholder nodes for deps we didn't fetch
    const allKnownNames = new Set(allPackages.map(p => p.name));
    const placeholderDeps = [...allDependencyNames].filter(d => !allKnownNames.has(d));
    if (placeholderDeps.length > 0) {
      console.log(`📝 Creating ${placeholderDeps.length} placeholder Package nodes...`);
      await session.run(
        `UNWIND $names AS name
         MERGE (p:Package {name: name})
         SET p.ecosystem = 'npm', p.description = '', p.latest_version = '0.0.0'`,
        { names: placeholderDeps }
      );
    }

    // ── Step 4: Create Version nodes + HAS_VERSION ──────────────────────
    console.log('📝 Creating Version nodes...');
    await session.run(
      `UNWIND $packages AS pkg
       MATCH (p:Package {name: pkg.name})
       MERGE (v:Version {number: pkg.latest_version, package: pkg.name})
       SET v.release_date = pkg.release_date
       MERGE (p)-[:HAS_VERSION]->(v)`,
      {
        packages: allPackages.map(p => ({
          name: p.name,
          latest_version: p.latest_version,
          release_date: p.release_date || '',
        })),
      }
    );

    // ── Step 5: Create DEPENDS_ON relationships ─────────────────────────
    console.log('🔗 Creating DEPENDS_ON relationships...');
    const depEdges = [];
    for (const pkg of allPackages) {
      for (const dep of pkg.dependencies) {
        depEdges.push({
          fromPkg: pkg.name,
          fromVersion: pkg.latest_version,
          toPkg: dep,
        });
      }
    }

    // Batch in chunks of 500
    for (let i = 0; i < depEdges.length; i += 500) {
      const chunk = depEdges.slice(i, i + 500);
      await session.run(
        `UNWIND $edges AS edge
         MATCH (v:Version {number: edge.fromVersion, package: edge.fromPkg})
         MATCH (dep:Package {name: edge.toPkg})
         MERGE (v)-[:DEPENDS_ON]->(dep)`,
        { edges: chunk }
      );
    }
    console.log(`   Created ${depEdges.length} DEPENDS_ON relationships`);

    // ── Step 6: Create Maintainer nodes + MAINTAINED_BY ─────────────────
    console.log('👤 Creating Maintainer nodes...');
    const maintainerEdges = [];
    for (const pkg of allPackages) {
      for (const m of pkg.maintainers) {
        maintainerEdges.push({
          pkgName: pkg.name,
          username: m.username,
          email: m.email,
        });
      }
    }

    await session.run(
      `UNWIND $edges AS edge
       MERGE (m:Maintainer {username: edge.username})
       SET m.email = edge.email
       WITH m, edge
       MATCH (p:Package {name: edge.pkgName})
       MERGE (p)-[:MAINTAINED_BY]->(m)`,
      { edges: maintainerEdges }
    );
    console.log(`   Created ${maintainerEdges.length} MAINTAINED_BY relationships`);

    // ── Step 7: Create Vulnerability nodes + AFFECTED_BY ────────────────
    console.log('🛡️  Creating Vulnerability nodes...');
    await session.run(
      `UNWIND $vulns AS v
       MERGE (vuln:Vulnerability {cve_id: v.cve_id})
       SET vuln.severity = v.severity,
           vuln.description = v.description,
           vuln.published_date = v.published_date`,
      { vulns: SYNTHETIC_VULNS }
    );

    for (const assignment of VULN_ASSIGNMENTS) {
      for (const pkgName of assignment.packages) {
        await session.run(
          `MATCH (p:Package {name: $pkgName})-[:HAS_VERSION]->(v:Version)
           MATCH (vuln:Vulnerability {cve_id: $cveId})
           MERGE (v)-[:AFFECTED_BY]->(vuln)`,
          { pkgName, cveId: assignment.cve_id }
        );
      }
    }
    console.log(`   Created ${SYNTHETIC_VULNS.length} vulnerabilities with assignments`);

    // ── Summary ─────────────────────────────────────────────────────────
    const countResult = await session.run(`
      MATCH (p:Package) WITH count(p) AS packages
      MATCH (v:Version) WITH packages, count(v) AS versions
      MATCH (m:Maintainer) WITH packages, versions, count(m) AS maintainers
      MATCH (vuln:Vulnerability) WITH packages, versions, maintainers, count(vuln) AS vulns
      RETURN packages, versions, maintainers, vulns
    `);

    const counts = countResult.records[0];
    console.log('\n' + '='.repeat(50));
    console.log('✅ Seed complete!');
    console.log(`   📦 Packages:       ${counts.get('packages')}`);
    console.log(`   📋 Versions:       ${counts.get('versions')}`);
    console.log(`   👤 Maintainers:    ${counts.get('maintainers')}`);
    console.log(`   🛡️  Vulnerabilities: ${counts.get('vulns')}`);
    console.log(`   🔗 Dependencies:   ${depEdges.length}`);
    console.log('='.repeat(50));

  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    throw err;
  } finally {
    await session.close();
    await driver.close();
  }
}

seed().catch(() => process.exit(1));
