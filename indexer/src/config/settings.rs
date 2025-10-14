use alloy::primitives::Address;
use serde::Deserialize;

use config::{Config, Environment, File};
use dotenv::dotenv;

#[derive(Debug, Deserialize)]
pub struct Settings {
    pub blockchain: BlockchainSettings,
    pub contract: ContractSettings,
    pub database_url: String
}

// #[derive(Debug, Deserialize)]
// pub struct DatabaseSettings {
//     pub url: String
// }

#[derive(Debug, Clone, PartialEq)]
pub enum Contract {
    KYC,
    NFT,
    Token,
}

#[derive(Debug, Deserialize)]
pub struct ContractSettings {
    pub nft_address: Address,
    pub token_address: Address,
    pub kyc_address: Address
}

#[derive(Debug, Deserialize)]
pub struct BlockchainSettings {
    pub ws_url: String,
    pub http_url: String,
}

impl ContractSettings {
    pub fn identify_contract(&self, address: Address) -> Option<Contract> {
        match address {
            addr if addr == self.kyc_address => Some(Contract::KYC),
            addr if addr == self.nft_address => Some(Contract::NFT),
            addr if addr == self.token_address => Some(Contract::Token),
            _ => None,
        }
    }
}

impl Settings {
    pub fn load() -> Result<Settings, config::ConfigError> {
        dotenv().ok(); // Load .env into environment variables

        let config = Config::builder()
            .add_source(File::with_name("src/config/default"))
            .add_source(Environment::default().separator("__"))
            .add_source(File::with_name("default").required(false))
            .build()?;

        config.try_deserialize::<Settings>()
    }
}
