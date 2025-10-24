-- Add migration script here

CREATE TABLE marketplace (
    ID SERIAL PRIMARY KEY,
    nft_contract VARCHAR(66) NOT NULL,
    seller VARCHAR(66) NOT NULL,
    token_id BIGINT NOT NULL,
    price BIGINT NOT NULL
);
