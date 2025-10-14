-- Add migration script here

CREATE TABLE block (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42) NOT NULL UNIQUE
);

ALTER TABLE transactions DROP COLUMN block_number;
ALTER TABLE transactions ADD COLUMN block_number BIGINT;
ALTER TABLE transactions ADD CONSTRAINT fk_block_number FOREIGN KEY (block_number) REFERENCES block(id);

CREATE TABLE nft (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(64) NOT NULL UNIQUE,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    value NUMERIC(38, 0) NOT NULL,
    block_number BIGINT NOT NULL REFERENCES block(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE kyc (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(64) NOT NULL UNIQUE,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    value NUMERIC(38, 0) NOT NULL,
    block_number BIGINT NOT NULL REFERENCES block(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);