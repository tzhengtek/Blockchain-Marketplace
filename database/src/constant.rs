pub const INSERT_INTO_BLOCK: &str = "
            INSERT INTO block (block_number) VALUES ($1) 
                ON CONFLICT (block_number) DO UPDATE SET block_number = EXCLUDED.block_number
                RETURNING id;
            ";
// pub const INSERT_TRANSACTION_INTO: &str = "
//             INSERT INTO {} (
//                 transaction_hash, 
//                 from_address, 
//                 to_address, 
//                 value,
//                 block_id
//             ) VALUES ($2, $3, $4, $5, $6)
//              ON CONFLICT (transaction_hash) DO NOTHING;";
