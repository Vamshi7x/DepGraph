// Cypher queries for cycle detection

export const DETECT_CYCLES = `
  MATCH path = (p:Package)-[:HAS_VERSION]->(:Version)-[:DEPENDS_ON*2..8]->(p)
  RETURN [n IN nodes(path) WHERE n:Package | n.name] AS cycle
  LIMIT 10
`;
