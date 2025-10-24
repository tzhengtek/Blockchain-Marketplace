-- Add migration script here

ALTER TABLE nft ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW();;
UPDATE nft SET timestamp = NOW();
