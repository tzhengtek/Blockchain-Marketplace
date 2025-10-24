-- Add migration script here

ALTER TABLE transactions ALTER COLUMN value TYPE BIGINT;
ALTER TABLE transactions ALTER COLUMN gas_used TYPE BIGINT;
