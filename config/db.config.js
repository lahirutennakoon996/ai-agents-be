import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  // ssl: { rejectUnauthorized: false }, // uncomment for remote hosted databases
});

const tables = {
  users: 'users',
  knowledgeChunks: 'knowledge_chunks',
};

export {
  pool,
  tables,
};
