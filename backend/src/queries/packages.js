// Cypher queries for package search and details

export const SEARCH_PACKAGES = `
  MATCH (p:Package)
  WHERE toLower(p.name) CONTAINS toLower($search)
  OPTIONAL MATCH (p)-[:HAS_VERSION]->(v:Version)
  WITH p, v ORDER BY v.release_date DESC
  WITH p, collect(v)[0] AS latest
  RETURN p.name AS name,
         p.ecosystem AS ecosystem,
         p.description AS description,
         p.latest_version AS latest_version,
         latest.release_date AS release_date
  ORDER BY p.name
  LIMIT 20
`;

export const GET_PACKAGE_DETAIL = `
  MATCH (p:Package {name: $name})
  OPTIONAL MATCH (p)-[:HAS_VERSION]->(v:Version)
  OPTIONAL MATCH (p)-[:MAINTAINED_BY]->(m:Maintainer)
  OPTIONAL MATCH (v)-[:DEPENDS_ON]->(dep:Package)
  OPTIONAL MATCH (v)-[:AFFECTED_BY]->(vuln:Vulnerability)
  WITH p, 
       collect(DISTINCT {number: v.number, release_date: v.release_date}) AS versions,
       collect(DISTINCT m.username) AS maintainers,
       collect(DISTINCT dep.name) AS dependencies,
       collect(DISTINCT {cve_id: vuln.cve_id, severity: vuln.severity, description: vuln.description}) AS vulnerabilities
  RETURN p.name AS name,
         p.ecosystem AS ecosystem,
         p.description AS description,
         p.latest_version AS latest_version,
         versions,
         maintainers,
         dependencies,
         vulnerabilities
`;

export const GET_PACKAGE_GRAPH = `
  MATCH (p:Package {name: $name})-[:HAS_VERSION]->(v:Version)-[:DEPENDS_ON]->(dep:Package)
  WITH p, collect(DISTINCT dep) AS deps
  UNWIND deps AS dep
  OPTIONAL MATCH (dep)-[:HAS_VERSION]->(dv:Version)-[:DEPENDS_ON]->(subdep:Package)
  RETURN p.name AS source,
         collect(DISTINCT dep.name) AS directDeps,
         collect(DISTINCT {from: dep.name, to: subdep.name}) AS transitiveDeps
`;

export const LIST_ALL_PACKAGES = `
  MATCH (p:Package)
  OPTIONAL MATCH (p)-[:HAS_VERSION]->(v:Version)-[:DEPENDS_ON]->(dep:Package)
  WITH p, count(DISTINCT dep) AS depCount
  RETURN p.name AS name,
         p.ecosystem AS ecosystem,
         p.description AS description,
         p.latest_version AS latest_version,
         depCount
  ORDER BY depCount DESC
  LIMIT 50
`;
