-- Add migration script here

ALTER TABLE token ADD column contract_address VARCHAR(66) NOT NULL;
DROP TABLE nft CASCADE;
DROP TABLE kyc CASCADE;
