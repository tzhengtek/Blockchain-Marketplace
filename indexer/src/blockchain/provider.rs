use alloy::{
    contract,
    eips::BlockNumberOrTag,
    providers::{Provider, ProviderBuilder, WsConnect},
    rpc::types::Filter,
    signers::k256::elliptic_curve::consts::False,
    sol,
    sol_types::SolEvent,
};

sol!(
    #[allow(missing_docs)]
    #[sol(rpc)]
    BEP20,
    "examples/abi/BEP20.json",
);

use colored::Colorize;

use futures_util::StreamExt;
use std::{error::Error, sync::Arc};

use crate::config::{Contract, Settings, settings::ContractSettings};
use database::{DatabasePool, TransactionEvent};

#[derive(Clone)]
pub struct BlockchainIndexer {
    provider: Arc<dyn Provider>,
}

impl BlockchainIndexer {
    pub async fn new(settings: &Settings) -> Result<Self, Box<dyn Error>> {
        print!("Connection to node...");
        let ws = WsConnect::new(&settings.blockchain.ws_url);
        let provider = ProviderBuilder::new().connect_ws(ws).await?;
        println!(": SUCCESS !");
        let provider = Arc::new(provider);
        // provider.multicall()
        Ok(Self { provider })
    }

    pub async fn fetch(
        &self,
        contracts_settings: ContractSettings,
        pool: DatabasePool,
    ) -> Result<(), Box<dyn Error>> {
        let addresses = vec![
            contracts_settings.token_address,
            contracts_settings.nft_address,
            contracts_settings.kyc_address,
        ];
        let filter = Filter::new()
            .address(addresses)
            .event("Transfer(address,address,uint256)")
            .from_block(BlockNumberOrTag::Latest);

        print!("Subscribing to contract logs...",);
        let sub = self.provider.subscribe_logs(&filter).await?;
        println!(": SUCCESS !");
        let mut stream = sub.into_stream();

        while let Some(log) = stream.next().await {
            // println!("{:?}", log);
            let contract_type = match contracts_settings.identify_contract(log.address()) {
                Some(Contract::KYC) => Ok("kyc"),
                Some(Contract::NFT) => Ok("nft"),
                Some(Contract::Token) => Ok("token"),
                None => Err("Not a existing contract"),
            };
            match log.topic0() {
                Some(&BEP20::Transfer::SIGNATURE_HASH) => {
                    println!(
                        "Hash :\t{}",
                        log.transaction_hash
                            .ok_or("Not existing transaction hash")?
                            .to_string()
                            .bold()
                    );
                    let BEP20::Transfer {
                        from, to, value, ..
                    } = log.log_decode()?.inner.data;
                    println!("{}", format!("From :\t{}", from).bold());
                    println!("{}", format!("To :\t{}", to).bold());
                    println!("{}", format!("Value :\t{}", value).bold());
                    println!(
                        "Block Number : {}",
                        log.block_number
                            .ok_or("Not existing block number")?
                            .to_string()
                            .bold()
                    );
                    let block_number: i64 = i64::try_from(
                        log.block_number
                            .ok_or_else(|| "Block number is missing".to_string())?,
                    )
                    .map_err(|e| format!("Failed to convert block_number: {}", e))?;
                    println!("BLOCK : {}", block_number);
                    let block_id = pool.add_block(block_number).await?;
                    let transaction = TransactionEvent {
                        transaction_hash: log
                            .transaction_hash
                            .ok_or("Not existing transaction hash")?
                            .to_string(),
                        from_address: from.to_string(),
                        to_address: to.to_string(),
                        value: value.to_string(),
                        block_id: block_id,
                    };
                    pool.add_transaction(transaction, &contract_type?).await?;
                }

                _ => {
                    println!("Not a Transfer Event !");
                    println!(
                        "Block Number : {}",
                        log.block_number
                            .ok_or("Not existing block number")?
                            .to_string()
                            .bold()
                    );
                }
            }
        }
        Ok(())
    }
}
