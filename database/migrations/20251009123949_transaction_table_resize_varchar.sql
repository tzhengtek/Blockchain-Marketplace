-- Add migration script here

ALTER TABLE transactions ALTER COLUMN transaction_hash TYPE VARCHAR(66);