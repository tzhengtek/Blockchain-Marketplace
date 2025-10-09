use alloy::primitives::Address;
use serde::Deserialize;

use config::{Config, Environment};
use dotenv::dotenv;

#[derive(Deserialize)]
pub struct Settings {
    pub blockchain: BlockchainSettings,
    pub contract: ContractSettings,
    pub database_url: String
}

// #[derive(Debug, Deserialize)]
// pub struct DatabaseSettings {
//     pub url: String
// }

#[derive(Deserialize)]
pub struct ContractSettings {
    pub address: Address,
}

#[derive(Deserialize)]
pub struct BlockchainSettings {
    pub ws_url: String,
    pub http_url: String,
}

impl Settings {
    pub fn load() -> Result<Settings, config::ConfigError> {
        dotenv().ok(); // Load .env into environment variables

        let config = Config::builder()
            .add_source(Environment::default().separator("__"))
            .build()?;

        config.try_deserialize::<Settings>()
    }
}
