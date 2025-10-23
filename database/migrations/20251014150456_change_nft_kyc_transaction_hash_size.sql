-- Add migration script here

ALTER TABLE nft ALTER COLUMN transaction_hash TYPE VARCHAR(66);

ALTER TABLE kyc ALTER COLUMN transaction_hash TYPE VARCHAR(66);
