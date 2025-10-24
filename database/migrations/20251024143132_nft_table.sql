-- Add migration script here

CREATE TABLE nft (
    id SERIAL PRIMARY KEY,
    owner VARCHAR(64) NOT NULL,
    token_id BIGINT NOT NULL,
    contract_address VARCHAR(64) NOT NULL
);
