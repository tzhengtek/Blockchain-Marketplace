-- Add migration script here

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42) NOT NULL UNIQUE,
    isKYCVerified BOOLEAN DEFAULT FALSE,
    isBanned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "wine" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    year INT,
    region VARCHAR(255),
    contract VARCHAR(42) NOT NULL UNIQUE,
    address VARCHAR(42) NOT NULL UNIQUE,
    userId INT REFERENCES "user"(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "transactions" (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(64) NOT NULL UNIQUE,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    value NUMERIC(38, 0) NOT NULL,
    gas_used NUMERIC(38, 0) NOT NULL,
    block_number BIGINT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);