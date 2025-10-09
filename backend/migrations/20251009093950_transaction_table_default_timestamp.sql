-- Add migration script here

ALTER TABLE transactions ALTER COLUMN timestamp SET DEFAULT now();