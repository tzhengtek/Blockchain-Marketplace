use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::Row;
use sqlx::{postgres::PgPool, query_as};
use std::cmp;

const INSERT_INTO_BLOCK: &str = "
            INSERT INTO block (block_number) VALUES ($1) 
                ON CONFLICT (block_number) DO UPDATE SET block_number = EXCLUDED.block_number
                RETURNING id;
            ";

#[derive(sqlx::FromRow, Debug, Deserialize, Serialize)]
pub struct TransactionEvent {
    pub transaction_hash: String,
    pub from_address: String,
    pub to_address: String,
    pub timestamp: Option<DateTime<Utc>>,
    pub value: String,
    pub block_id: i32,
    pub contract_address: String,
}

#[serde_with::serde_as]
#[derive(Debug, Deserialize)]
#[serde(default)]
pub struct TransactionParams {
    pagination: i64,
    limit: i64,
    contract_address: Option<String>,
    transaction_hash: Option<String>,
    from: Option<String>,
    to: Option<String>,
}

impl Default for TransactionParams {
    fn default() -> Self {
        Self {
            pagination: 1,
            limit: 50,
            contract_address: None,
            transaction_hash: None,
            from: None,
            to: None,
        }
    }
}

#[derive(Clone)]
pub struct DatabasePool(PgPool);

impl From<PgPool> for DatabasePool {
    fn from(value: PgPool) -> Self {
        Self(value)
    }
}

impl DatabasePool {
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        print!("Connection to the database...");
        let provider: PgPool = PgPool::connect(database_url).await?;
        tracing::info!(": SUCCESS !");
        Ok(Self(provider))
    }
    pub async fn add_block(&self, block_number: u64) -> Result<i32, sqlx::Error> {
        tracing::info!("Adding block number...");
        let row = sqlx::query(INSERT_INTO_BLOCK)
            .bind(i64::try_from(block_number).map_err(|e| {
                sqlx::Error::InvalidArgument(
                    format!("Error while converting to i64 {e:?}").to_string(),
                )
            })?)
            .fetch_one(&self.0)
            .await?;
        Ok(row.get::<i32, _>("id"))
    }

    pub async fn add_transaction(&self, transaction: TransactionEvent) -> Result<(), sqlx::Error> {
        print!("Adding transaction...");
        let insert_transaction_into = format!(
            "INSERT INTO token (
                    transaction_hash, 
                    from_address, 
                    to_address, 
                    value,
                    block_id,
                    contract_address
                ) VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (transaction_hash) DO NOTHING",
        );
        query_as::<_, TransactionEvent>(&insert_transaction_into)
            .bind(&transaction.transaction_hash)
            .bind(&transaction.from_address)
            .bind(&transaction.to_address)
            .bind(transaction.value)
            .bind(transaction.block_id)
            .bind(&transaction.contract_address)
            .fetch_optional(&self.0)
            .await?;
        tracing::info!(": SUCCESS !");
        Ok(())
    }

    pub async fn get_transaction(
        &self,
        transaction_params: &TransactionParams,
    ) -> Result<Vec<TransactionEvent>, sqlx::Error> {
        let filter_contract = match &transaction_params.contract_address {
            Some(address) => format!("AND contract_address='{}'", address),
            None => "".to_string(),
        };
        let filter_transaction = match &transaction_params.transaction_hash {
            Some(address) => format!("AND transaction_hash='{}'", address),
            None => "".to_string(),
        };
        let filter_from = match &transaction_params.from {
            Some(address) => format!("AND from='{}'", address),
            None => "".to_string(),
        };
        let filter_to = match &transaction_params.to {
            Some(address) => format!("AND WHERE to='{}'", address),
            None => "".to_string(),
        };
        let get_transaction_request = format!(
            "SELECT * FROM token WHERE 1=1 {filter_contract} {filter_from} {filter_to} {filter_transaction} ORDER BY timestamp DESC LIMIT $1 OFFSET $2"
        );
        let results = query_as::<_, TransactionEvent>(&get_transaction_request)
            .bind(transaction_params.limit)
            .bind(cmp::max(transaction_params.pagination - 1, 0) * transaction_params.limit)
            .fetch_all(&self.0)
            .await?;
        Ok(results)
    }
}
