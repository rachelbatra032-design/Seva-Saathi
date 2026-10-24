-- Up: migrate chunk embeddings from jsonb to native pgvector (reversible via 0001_pgvector_embedding.down.sql)

ALTER TABLE chunks ADD COLUMN IF NOT EXISTS embedding_vec vector(384);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chunks' AND column_name = 'embedding' AND udt_name = 'jsonb'
  ) THEN
    UPDATE chunks
    SET embedding_vec = (
      SELECT ('[' || string_agg(elem::text, ',') || ']')::vector(384)
      FROM jsonb_array_elements_text(chunks.embedding) AS elem
    )
    WHERE embedding IS NOT NULL AND embedding_vec IS NULL;

    ALTER TABLE chunks DROP COLUMN embedding;
    ALTER TABLE chunks RENAME COLUMN embedding_vec TO embedding;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chunks' AND column_name = 'embedding_vec'
  ) THEN
    ALTER TABLE chunks RENAME COLUMN embedding_vec TO embedding;
  END IF;
END $$;

DROP INDEX IF EXISTS chunks_embedding_hnsw_idx;
CREATE INDEX IF NOT EXISTS chunks_embedding_hnsw_idx ON chunks USING hnsw (embedding vector_cosine_ops);
