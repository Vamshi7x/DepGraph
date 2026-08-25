// Cypher queries for shortest path between packages

export const SHORTEST_PATH = `
  MATCH (a:Package {name: $from}), (b:Package {name: $to})
  MATCH path = shortestPath(
    (a)-[:HAS_VERSION|DEPENDS_ON*..15]->(b)
  )
  RETURN [n IN nodes(path) WHERE n:Package | n.name] AS chain,
         length(path) AS totalHops
`;

export const ALL_SHORT_PATHS = `
  MATCH (a:Package {name: $from}), (b:Package {name: $to})
  MATCH path = allShortestPaths(
    (a)-[:HAS_VERSION|DEPENDS_ON*..15]->(b)
  )
  RETURN [n IN nodes(path) WHERE n:Package | n.name] AS chain,
         length(path) AS totalHops
  LIMIT 5
`;
