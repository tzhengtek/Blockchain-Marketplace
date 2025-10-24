use eyre::Result;
use std::error::Error;

mod blockchain;
mod config;

use blockchain::BlockchainIndexer;
use config::Settings;
use database::DatabasePool;

use tracing_subscriber::filter::EnvFilter;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::{fmt, layer::SubscriberExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    tracing_subscriber::registry()
        .with(fmt::layer())
        .with(EnvFilter::from_default_env())
        .init();
    let settings = match Settings::load() {
        Ok(setting) => setting,
        Err(e) => panic!("{}", e),
    };

    tracing::info!("{:?}", settings);
    tracing::info!("POOL");
    let pool = DatabasePool::new(&settings.database_url).await?;
    let indexer = BlockchainIndexer::new(&settings).await?;
    let _ = indexer.fetch(settings.contract, pool).await?;
    Ok(())
}
