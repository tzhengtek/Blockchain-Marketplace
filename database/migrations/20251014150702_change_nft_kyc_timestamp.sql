-- Add migration script here

ALTER TABLE nft ALTER COLUMN timestamp SET DEFAULT now();

ALTER TABLE kyc ALTER COLUMN timestamp SET DEFAULT now();