import "dotenv/config";

import { pool, tables } from "../../config/db.config.js";
import { embed } from "../knowledge-chunks/knowledge-chunks.service.js";

// Split text into overlapping chunks for better retrieval
function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

// Ingest one document
export async function ingestDocument(content, source = "unknown") {
  const chunks = chunkText(content);
  console.log(`Ingesting ${chunks.length} chunks from "${source}"...`);

  for (const chunk of chunks) {
    const embedding = await embed(chunk);

    await pool.query(
      `INSERT INTO ${tables.knowledgeChunks} (source, content, embedding)
       VALUES ($1, $2, $3)`,
      [source, chunk, JSON.stringify(embedding)]
    );
  }
  console.log(`Done ingesting.`);
}

// Example: ingest a string directly
// Replace with reading from files, a CMS, a database, etc.
await ingestDocument(
  `Our refund policy allows customers to request a full refund
   within 30 days of purchase. After 30 days, store credit is
   offered. Refunds are processed within 5-7 business days.`,
  "refund-policy.txt"
);

await ingestDocument(
  `Shipping typically takes 3-5 business days for standard delivery
   and 1-2 business days for express. International orders may take
   7-14 business days depending on customs.`,
  "shipping-policy.txt"
);

process.exit(0);