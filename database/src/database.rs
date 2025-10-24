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

use utoipa::ToSchema;

#[derive(sqlx::FromRow, Debug, Deserialize, Serialize, ToSchema)]
pub struct NFTEvent {
    pub owner: String,
    pub token_id: i64,
    pub contract_address: String,
}

#[derive(sqlx::FromRow, Debug, Deserialize, Serialize, ToSchema)]
pub struct ListedNFT {
    pub seller: String,
    pub token_id: i64,
    pub nft_contract: String,
    pub price: i64,
}

#[serde_with::serde_as]
#[derive(Debug, Deserialize)]
#[serde(default)]
pub struct NFTParams {
    pagination: i64,
    limit: i64,
    owner: Option<String>,
}

impl Default for NFTParams {
    fn default() -> Self {
        Self {
            pagination: 1,
            limit: 50,
            owner: None,
        }
    }
}

#[derive(sqlx::FromRow, Debug, Deserialize, Serialize, ToSchema)]
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
        tracing::info!("Connection to the database...");
        let provider: PgPool = PgPool::connect(database_url).await?;
        tracing::info!("Connected to the database...");
        Ok(Self(provider))
    }

    pub async fn get_listing_nft(&self) -> Result<Vec<ListedNFT>, sqlx::Error> {
        tracing::info!("Getting all listing nft in marketplace...");
        let res = sqlx::query_as::<_, ListedNFT>("SELECT * FROM marketplace")
            .fetch_all(&self.0)
            .await?;
        Ok(res)
    }

    pub async fn removing_nft(
        &self,
        nft_contract: String,
        token_id: u64,
    ) -> Result<(), sqlx::Error> {
        tracing::info!("Removing (solded) nft from marketplace...");
        sqlx::query("DELETE FROM marketplace WHERE nft_contract=$1 AND token_id=$2")
            .bind(&nft_contract)
            .bind(token_id)
            .fetch_optional(&self.0)
            .await?;
        Ok(())
    }

    pub async fn listing_nft(
        &self,
        nft_contract: String,
        token_id: u64,
        seller: String,
        price: u64,
    ) -> Result<(), sqlx::Error> {
        tracing::info!("Listing NFT in marketplace...");
        sqlx::query("INSERT INTO marketplace (nft_contract, seller, token_id, price) VALUES ($1, $2, $3, $4)")
        .bind(&nft_contract).bind(&seller).bind(i64::try_from(token_id).map_err(|e| {
                sqlx::Error::InvalidArgument(
                    format!("Error while converting to i64 {e:?}").to_string(),
                )
            })?).bind(i64::try_from(price).map_err(|e| {
                sqlx::Error::InvalidArgument(
                    format!("Error while converting to i64 {e:?}").to_string(),
                )
            })?).fetch_optional(&self.0).await?;
        Ok(())
    }

    pub async fn add_nft(
        &self,
        owner: String,
        token_id: u64,
        contract_address: &String,
    ) -> Result<(), sqlx::Error> {
        tracing::info!("Adding NFT to the database...");
        sqlx::query("INSERT INTO nft (owner, token_id, contract_address) VALUES ($1, $2, $3)")
            .bind(&owner)
            .bind(i64::try_from(token_id).map_err(|e| {
                sqlx::Error::InvalidArgument(
                    format!("Error while converting to i64 {e:?}").to_string(),
                )
            })?)
            .bind(contract_address)
            .fetch_optional(&self.0)
            .await?;
        Ok(())
    }

    pub async fn add_kyc(&self, wallet_account: String) -> Result<(), sqlx::Error> {
        tracing::info!("Authorizing user wallet in database...");
        sqlx::query(
            "INSERT INTO \"user\" (address, iskycverified) VALUES ($1, $2) ON CONFLICT (address) DO NOTHING",
        ).bind(&wallet_account).bind(true).fetch_optional(&self.0).await?;
        Ok(())
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
        tracing::info!("Adding token in database...");
        let insert_transaction_into = "INSERT INTO token (
                    transaction_hash, 
                    from_address, 
                    to_address, 
                    value,
                    block_id,
                    contract_address
                ) VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (transaction_hash) DO NOTHING"
            .to_string();

        query_as::<_, TransactionEvent>(&insert_transaction_into)
            .bind(&transaction.transaction_hash)
            .bind(&transaction.from_address)
            .bind(&transaction.to_address)
            .bind(transaction.value)
            .bind(transaction.block_id)
            .bind(&transaction.contract_address)
            .fetch_optional(&self.0)
            .await?;
        Ok(())
    }

    pub async fn get_nft(
        &self,
        nft_params: &NFTParams,
    ) -> Result<(u64, Vec<NFTEvent>), sqlx::Error> {
        tracing::info!("Get NFT from database...");
        let filter_owner = match &nft_params.owner {
            Some(owner) => format!("AND owner='{}'", owner),
            None => "".to_string(),
        };
        let get_nft_request = format!(
            "SELECT * FROM nft WHERE 1=1 {filter_owner} ORDER BY timestamp DESC LIMIT $1 OFFSET $2"
        );
        let results = query_as::<_, NFTEvent>(&get_nft_request)
            .bind(nft_params.limit)
            .bind(cmp::max(nft_params.pagination - 1, 0) * nft_params.limit)
            .fetch_all(&self.0)
            .await?;
        tracing::info!(get_nft_request);
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM nft")
            .fetch_one(&self.0)
            .await?;
        Ok((count as u64, results))
    }

    pub async fn get_transaction(
        &self,
        transaction_params: &TransactionParams,
    ) -> Result<(u64, Vec<TransactionEvent>), sqlx::Error> {
        tracing::info!("Getting tokens from database...");

        let filter_contract = match &transaction_params.contract_address {
            Some(address) => format!("AND contract_address='{}'", address),
            None => "".to_string(),
        };
        let filter_transaction = match &transaction_params.transaction_hash {
            Some(address) => format!("AND transaction_hash='{}'", address),
            None => "".to_string(),
        };
        let filter_from = match &transaction_params.from {
            Some(address) => format!("AND from_address='{}'", address),
            None => "".to_string(),
        };
        let filter_to = match &transaction_params.to {
            Some(address) => format!("AND to_address='{}'", address),
            None => "".to_string(),
        };
        let get_transaction_request = format!(
            "SELECT * FROM token WHERE 1=1 {filter_contract} {filter_from} {filter_to} {filter_transaction} ORDER BY timestamp DESC LIMIT $1 OFFSET $2"
        );
        tracing::info!(get_transaction_request);
        let results = query_as::<_, TransactionEvent>(&get_transaction_request)
            .bind(transaction_params.limit)
            .bind(cmp::max(transaction_params.pagination - 1, 0) * transaction_params.limit)
            .fetch_all(&self.0)
            .await?;
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM token")
            .fetch_one(&self.0)
            .await?;
        Ok((count as u64, results))
    }
}
