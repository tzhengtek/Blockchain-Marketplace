-- Add migration script here

ALTER TABLE block DROP COLUMN address;
ALTER TABLE block ADD COLUMN block_number BIGINT;