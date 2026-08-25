// Cypher queries for ecosystem statistics

export const MOST_DEPENDED_ON = `
  MATCH (dep:Package)<-[:DEPENDS_ON]-(:Version)<-[:HAS_VERSION]-(pkg:Package)
  WITH dep, count(DISTINCT pkg) AS dependentCount
  RETURN dep.name AS name,
         dep.description AS description,
         dep.latest_version AS version,
         dependentCount
  ORDER BY dependentCount DESC
  LIMIT 20
`;

export const MAINTAINER_RISK = `
  MATCH (m:Maintainer)<-[:MAINTAINED_BY]-(p:Package)<-[:DEPENDS_ON]-(:Version)<-[:HAS_VERSION]-(dependent:Package)
  WITH m, collect(DISTINCT p.name) AS packages, count(DISTINCT dependent) AS totalDependents
  WHERE size(packages) >= 2
  RETURN m.username AS maintainer,
         packages,
         totalDependents
  ORDER BY totalDependents DESC
  LIMIT 10
`;

export const ECOSYSTEM_OVERVIEW = `
  MATCH (p:Package)
  OPTIONAL MATCH (v:Version)
  OPTIONAL MATCH (m:Maintainer)
  OPTIONAL MATCH (vuln:Vulnerability)
  RETURN count(DISTINCT p) AS packageCount,
         count(DISTINCT v) AS versionCount,
         count(DISTINCT m) AS maintainerCount,
         count(DISTINCT vuln) AS vulnerabilityCount
`;
