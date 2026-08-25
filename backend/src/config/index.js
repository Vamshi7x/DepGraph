import dotenv from 'dotenv';
dotenv.config();

const config = {
  neo4j: {
    uri: process.env.BOLT_URI || 'bolt://localhost:7687',
    user: process.env.BOLT_USER || 'neo4j',
    password: process.env.BOLT_PASSWORD || 'password',
  },
  server: {
    port: parseInt(process.env.PORT, 10) || 3001,
  },
};

export default config;
