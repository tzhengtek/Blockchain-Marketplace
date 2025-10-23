-- Add migration script here

ALTER TABLE nft DROP COLUMN block_number;
ALTER TABLE nft ADD COLUMN block_id INT;
ALTER TABLE nft ADD CONSTRAINT fk_block_id FOREIGN KEY (block_id) REFERENCES block(id);

ALTER TABLE kyc DROP COLUMN block_number;
ALTER TABLE kyc ADD COLUMN block_id INT;
ALTER TABLE kyc ADD CONSTRAINT fk_block_id FOREIGN KEY (block_id) REFERENCES block(id);