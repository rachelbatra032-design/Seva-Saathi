-- Down: restore jsonb embeddings from pgvector column

ALTER TABLE chunks ADD COLUMN IF NOT EXISTS embedding_json jsonb;

UPDATE chunks
SET embedding_json = to_jsonb(embedding::real[])
WHERE embedding IS NOT NULL AND embedding_json IS NULL;

DROP INDEX IF EXISTS chunks_embedding_hnsw_idx;
ALTER TABLE chunks DROP COLUMN IF EXISTS embedding;
ALTER TABLE chunks RENAME COLUMN embedding_json TO embedding;
