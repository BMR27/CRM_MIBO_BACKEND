-- Migration: Allow 'agent' as sender_type in messages
ALTER TABLE messages
    DROP CONSTRAINT IF EXISTS messages_sender_type_check;
ALTER TABLE messages
    ADD CONSTRAINT messages_sender_type_check
    CHECK (sender_type IN ('user', 'contact', 'agent'));
