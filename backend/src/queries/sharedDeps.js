// Cypher queries for shared dependencies between two packages

export const SHARED_DEPENDENCIES = `
  MATCH (a:Package {name: $pkgA})-[:HAS_VERSION]->(:Version)-[:DEPENDS_ON]->(shared:Package)<-[:DEPENDS_ON]-(:Version)<-[:HAS_VERSION]-(b:Package {name: $pkgB})
  RETURN DISTINCT shared.name AS name,
         shared.description AS description,
         shared.latest_version AS version
  ORDER BY shared.name
`;

export const SHARED_DEPS_COUNT = `
  MATCH (a:Package {name: $pkgA})-[:HAS_VERSION]->(:Version)-[:DEPENDS_ON]->(shared:Package)<-[:DEPENDS_ON]-(:Version)<-[:HAS_VERSION]-(b:Package {name: $pkgB})
  RETURN count(DISTINCT shared) AS count
`;
