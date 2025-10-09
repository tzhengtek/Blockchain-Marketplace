use std::sync::Arc;

// // use sqlx::postgres::PgPoolOptions;
use sqlx::{
    postgres::PgPool,
    query_as
};
// use sqlx_postgres::{PgPool, PgRow};
#[derive(sqlx::FromRow)]
pub struct TransactionEvent {
    pub transaction_hash: String,
    pub from_address: String,
    pub to_address: String,
    pub value: i64,
    pub gas_used: i64,
    pub block_number: i64,
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

    pub async fn add_transaction(
        &self,
        transaction: TransactionEvent,
    ) -> Result<(), sqlx::Error> {
        print!("Adding transaction...");
        let _ = query_as::<_, TransactionEvent>(
            "INSERT INTO transactions (
                transaction_hash, 
                from_address, 
                to_address, 
                value, 
                gas_used, 
                block_number
            ) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (transaction_hash) DO NOTHING;",
        )
        .bind(&transaction.transaction_hash)
        .bind(&transaction.from_address)
        .bind(&transaction.to_address)
        .bind(transaction.value)
        .bind(transaction.gas_used)
        .bind(transaction.block_number)
        .fetch_optional(&*self.provider)
        .await?;
        println!(": SUCCESS !");
        Ok(())
    }
    // println!("COnnection!");
    // let address = "aa";
    // let rec = sqlx::query(r#"SELECT * FROM "user" WHERE address = $1"#)
    //     .bind(address)
    //     .fetch_all(&pool)
    //     .await?;
    // // let rec = sqlx::query!(r#"SELECT $1"#)
    // // .bind(150_i64)
    // // .fetch_one(&pool)
    // // .await?;
    // // println!("{:?}", row.0);
    // Ok(rec)
}
