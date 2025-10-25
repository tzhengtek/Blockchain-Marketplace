use alloy::primitives::Address;
use serde::Deserialize;

use anyhow::{Error, Result};
use config::{Config, Environment, File};
use dotenv::dotenv;

#[derive(Debug, Deserialize)]
pub struct Settings {
    pub blockchain: BlockchainSettings,
    pub contract: ContractSettings,
    pub database_url: String,
    pub wallet_private_key: String,
}

#[derive(Debug, Deserialize)]
pub struct ContractSettings {
    pub nft_address: Address,
    pub token_address: Address,
    pub kyc_address: Address,
    pub market_address: Address,
    pub oracle_address: Address,
}

#[derive(Debug, Deserialize)]
pub struct BlockchainSettings {
    pub ws_url: String,
}

impl Settings {
    pub fn load() -> Result<Settings, Error> {
        dotenv().ok();

        const DEFAULT_CONFIG: &str = include_str!("default.toml");

        let config = Config::builder()
            .add_source(config::File::from_str(
                DEFAULT_CONFIG,
                config::FileFormat::Toml,
            ))
            .add_source(Environment::default().separator("__"))
            .add_source(File::with_name("/app/config/default").required(false))
            .build()?;

        config
            .try_deserialize::<Settings>()
            .map_err(|_| Error::msg("Error while deserializing settings"))
    }
}
