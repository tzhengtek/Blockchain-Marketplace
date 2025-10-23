-- Add migration script here

ALTER TABLE transactions DROP COLUMN block_number;
ALTER TABLE transactions ADD COLUMN block_id INT;
ALTER TABLE transactions ADD CONSTRAINT fk_block_id FOREIGN KEY (block_id) REFERENCES block(id);