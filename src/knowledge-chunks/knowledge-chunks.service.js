import { pipeline } from "@xenova/transformers";

import { pool, tables } from "../../config/db.config.js";

// Downloads the model on first run (~25MB), then caches it locally
let embedder = null;

/**
 * Create vector embeddings from text
 * @param text
 * @returns {Promise<unknown[]>}
 */
export async function embed(text) {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data); // returns a 384-dimensional vector
}

/**
 * Search for the top-k most relevant chunks
 * @param query
 * @param topK
 * @returns {Promise<string>}
 */
export async function searchKnowledgeBase(query, topK = 3) {
  const queryEmbedding = await embed(query);

  // The <=> operator is pgvector's cosine distance.
  // Lower = more similar.
  // '1 - distance' flips it to a similarity score (1.0 = identical). The HNSW index makes this fast even with millions of rows.
  const result = await pool.query(
    `SELECT source, content,
            1 - (embedding <=> $1) AS similarity
     FROM ${tables.knowledgeChunks}
     ORDER BY embedding <=> $1
     LIMIT $2`,
    [JSON.stringify(queryEmbedding), topK]
  );

  if (result.rows.length === 0) {
    return "No relevant information found in the knowledge base.";
  }

  // Format results for Claude to read
  return result.rows
    .map(
      (row, i) =>
        `[Result ${i + 1} — ${row.source} (similarity: ${(row.similarity * 100).toFixed(0)}%)]\n${row.content}`
    )
    .join("\n\n");
}