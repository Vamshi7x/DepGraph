// Cypher queries for blast-radius / vulnerability impact analysis

export const BLAST_RADIUS_BY_PACKAGE = `
  MATCH (vulnerable:Package {name: $packageName})
  MATCH path = (affected:Package)-[:HAS_VERSION]->(:Version)-[:DEPENDS_ON*1..6]->(vulnerable)
  WITH DISTINCT affected, length(path) - 1 AS hops
  RETURN affected.name AS package, 
         affected.description AS description,
         hops
  ORDER BY hops
`;

export const BLAST_RADIUS_BY_CVE = `
  MATCH (vuln:Vulnerability {cve_id: $cveId})<-[:AFFECTED_BY]-(:Version)<-[:HAS_VERSION]-(vulnerable:Package)
  MATCH path = (affected:Package)-[:HAS_VERSION]->(:Version)-[:DEPENDS_ON*1..6]->(vulnerable)
  WITH DISTINCT affected, vulnerable, length(path) - 1 AS hops, vuln
  RETURN affected.name AS package,
         affected.description AS description,
         vulnerable.name AS vulnerablePackage,
         hops,
         vuln.severity AS severity
  ORDER BY hops
`;

export const BLAST_RADIUS_GRAPH = `
  MATCH (vulnerable:Package {name: $packageName})
  MATCH path = (affected:Package)-[:HAS_VERSION]->(v:Version)-[:DEPENDS_ON*1..4]->(vulnerable)
  WITH DISTINCT affected, vulnerable, 
       [n IN nodes(path) WHERE n:Package | n.name] AS chain,
       length(path) - 1 AS hops
  RETURN affected.name AS source,
         vulnerable.name AS target,
         chain,
         hops
  ORDER BY hops
  LIMIT 100
`;
