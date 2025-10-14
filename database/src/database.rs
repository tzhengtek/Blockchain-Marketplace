use std::sync::Arc;

use crate::constant::{INSERT_INTO_BLOCK};
// // use sqlx::postgres::PgPoolOptions
use sqlx::Row;
use sqlx::{
    postgres::{PgPool, PgRow},
    query_as,
};
// use sqlx_postgres::{PgPool, PgRow};
#[derive(sqlx::FromRow)]
pub struct TransactionEvent {
    pub transaction_hash: String,
    pub from_address: String,
    pub to_address: String,
    pub value: String,
    pub block_id: i32,
}

pub struct DatabasePool {
    pub provider: Arc<PgPool>,
}

impl DatabasePool {
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        print!("Connection to the database...");
        let provider: PgPool = PgPool::connect(database_url).await?;
        println!(": SUCCESS !");
        Ok(Self {
            provider: Arc::new(provider),
        })
    }

    pub async fn add_block(&self, block_number: i64) -> Result<i32, sqlx::Error> {
        println!("Adding block number...");
        let row = sqlx::query(INSERT_INTO_BLOCK)
            .bind(&block_number)
            .fetch_one(&*self.provider)
            .await?;
        Ok(row.get::<i32, _>("id"))
    }

    pub async fn add_transaction(
        &self,
        transaction: TransactionEvent,
        database: &str,
    ) -> Result<(), sqlx::Error> {
        print!("Adding transaction...");
        let INSERT_TRANSACTION_INTO = format!(
            "INSERT INTO {} (
                    transaction_hash, 
                    from_address, 
                    to_address, 
                    value,
                    block_id
                ) VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (transaction_hash) DO NOTHING",
            database
        );
        let _ = query_as::<_, TransactionEvent>(&INSERT_TRANSACTION_INTO.to_string())
            .bind(&transaction.transaction_hash)
            .bind(&transaction.from_address)
            .bind(&transaction.to_address)
            .bind(transaction.value)
            .bind(transaction.block_id)
            .fetch_optional(&*self.provider)
            .await?;
        println!(": SUCCESS !");
        Ok(())
    }
}
