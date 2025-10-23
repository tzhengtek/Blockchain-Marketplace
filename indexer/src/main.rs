use eyre::Result;
use std::error::Error;

mod blockchain;
mod config;

use blockchain::BlockchainIndexer;
use config::Settings;
use database::DatabasePool;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let settings = match Settings::load() {
        Ok(setting) => setting,
        Err(e) => panic!("{}", e),
    };

    println!("{:?}", settings);
    let pool = DatabasePool::new(&settings.database_url).await?;
    let indexer = BlockchainIndexer::new(&settings).await?;
    let _ = indexer.fetch(settings.contract, pool).await?;
    Ok(())
}
