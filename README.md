# DepGraph — Package Dependency & Vulnerability Impact Explorer

> Explore npm package dependency graphs, discover vulnerability blast radius, and analyze supply-chain risks — all powered by a Neo4j graph database.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![Neo4j](https://img.shields.io/badge/Neo4j-5.x-008CC1?style=flat&logo=neo4j)

## ✨ Features

- **🔍 Package Search** — Autocomplete search across the npm dependency graph
- **📊 Interactive Graph Visualization** — Force-directed graph with click-to-expand
- **💥 Blast Radius Explorer** — See what breaks if a package has a vulnerability
- **🔀 Package Comparison** — Shortest dependency path + shared dependencies
- **🛡️ Vulnerability Tracking** — CVE severity badges and impact analysis
- **📈 Ecosystem Stats** — Most depended-on packages, maintainer risk analysis

## 🏗️ Architecture

```
┌──────────────┐     REST API     ┌──────────────┐     Bolt      ┌──────────────┐
│   Frontend   │ ◄──────────────► │   Backend    │ ◄───────────► │    Neo4j     │
│  React+Vite  │    :5173/api     │   Express    │   :7687       │   CognoDB    │
│              │                  │              │               │              │
│ • Home       │                  │ /api/packages│               │ Package      │
│ • Detail     │                  │ /api/blast-  │               │ Version      │
│ • Blast      │                  │   radius     │               │ Maintainer   │
│ • Compare    │                  │ /api/path    │               │ Vulnerability│
│              │                  │ /api/shared  │               │              │
│              │                  │ /api/stats   │               │ DEPENDS_ON   │
│              │                  │ /api/health  │               │ MAINTAINED_BY│
└──────────────┘                  └──────────────┘               └──────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Neo4j** 5.x (local, Docker, or [Neo4j Aura](https://neo4j.com/cloud/aura/) free tier)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Database

```bash
# Copy and edit the environment file
cd backend
cp .env.example .env
# Edit .env with your Neo4j connection details
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This fetches real package data from the npm registry and loads it into Neo4j.

### 4. Start the App

```bash
# Terminal 1: Start the backend
cd backend
npm run dev

# Terminal 2: Start the frontend
cd frontend
npm run dev
```

Visit **http://localhost:5173** 🎉

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Database connectivity check |
| GET | `/api/packages?search=` | Search packages |
| GET | `/api/packages/:name` | Package details |
| GET | `/api/packages/:name/graph` | Dependency graph data |
| GET | `/api/blast-radius/:name` | Vulnerability blast radius |
| GET | `/api/path?from=&to=` | Shortest dependency path |
| GET | `/api/shared-deps?a=&b=` | Shared dependencies |
| GET | `/api/cycles` | Circular dependency detection |
| GET | `/api/stats/overview` | Ecosystem statistics |
| GET | `/api/stats/most-depended` | Most depended-on packages |
| GET | `/api/stats/maintainer-risk` | Single-maintainer risk |

## 🔑 Key Cypher Queries

### Multi-hop Blast Radius (headline query)
```cypher
MATCH (vulnerable:Package {name: $packageName})
MATCH path = (affected:Package)-[:HAS_VERSION]->(:Version)-[:DEPENDS_ON*1..6]->(vulnerable)
RETURN DISTINCT affected.name AS package, length(path) - 1 AS hops
ORDER BY hops
```

### Shortest Path
```cypher
MATCH (a:Package {name: $from}), (b:Package {name: $to})
MATCH path = shortestPath((a)-[:HAS_VERSION|DEPENDS_ON*..15]->(b))
RETURN [n IN nodes(path) WHERE n:Package | n.name] AS chain
```

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/       # Environment configuration
│   │   ├── db/           # Neo4j driver & session management
│   │   ├── queries/      # Parameterized Cypher queries
│   │   └── routes/       # Express route handlers
│   ├── scripts/
│   │   └── seed.js       # npm data fetcher & loader
│   ├── server.js         # Express app entry point
│   └── .env.example      # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── styles/       # Vanilla CSS design system
│   │   └── utils/        # API client
│   └── vite.config.js    # Vite + API proxy
└── README.md
```

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, react-force-graph-2d, React Router
- **Backend:** Node.js, Express, neo4j-driver
- **Database:** Neo4j / CognoDB (graph database)
- **Styling:** Vanilla CSS with design tokens
