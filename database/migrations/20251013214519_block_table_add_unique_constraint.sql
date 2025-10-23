-- Add migration script here

ALTER TABLE block DROP COLUMN block_number;
ALTER TABLE block ADD COLUMN block_number BIGINT UNIQUE NOT NULL;