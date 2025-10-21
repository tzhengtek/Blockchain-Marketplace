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
}

#[derive(Debug, Deserialize)]
pub struct BlockchainSettings {
    pub ws_url: String,
}

impl ContractSettings {
    pub fn identify_contract(&self, address: Address) -> Option<String> {
        match () {
            _ if address == self.kyc_address => Some(self.kyc_address.to_string()),
            _ if address == self.nft_address => Some(self.nft_address.to_string()),
            _ if address == self.token_address => Some(self.token_address.to_string()),
            _ => None,
        }
    }
}

impl Settings {
    pub fn load() -> Result<Settings, Error> {
        dotenv().ok(); // Load .env into environment variables

        let config_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let default_file_path = config_dir.join("src/config/default.toml");
        // Convert to a string slice for the config crate
        let default_file_str = default_file_path
            .to_str()
            .ok_or_else(|| Error::msg("Config path is not valid UTF-8"))?;

        let config = Config::builder()
            .add_source(config::File::from(default_file_path.as_path()).required(true))
            .add_source(Environment::default().separator("__"))
            .add_source(File::with_name("default").required(false))
            .build()?;
        config
            .try_deserialize::<Settings>()
            .map_err(|_| Error::msg("Error while deserializing settings"))
    }
}
