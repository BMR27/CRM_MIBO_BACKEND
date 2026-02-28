-- Elimina la restricción actual
ALTER TABLE messages DROP CONSTRAINT IF EXISTS "FK_3bc55a7c3f9ed54b520bb5cfe23";

-- Vuelve a crear la restricción con ON DELETE CASCADE
ALTER TABLE messages
ADD CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23"
FOREIGN KEY (conversation_id)
REFERENCES conversations(id)
ON DELETE CASCADE;
