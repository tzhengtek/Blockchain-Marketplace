use alloy::{
    eips::BlockNumberOrTag,
    primitives::Address,
    providers::{Provider, ProviderBuilder, WsConnect},
    rpc::types::Filter,
    sol,
    sol_types::SolEvent,
};

sol!(
    #[allow(missing_docs)]
    #[sol(rpc)]
    USDT,
    "examples/abi/USDT.json"
);

use colored::Colorize;

use futures_util::StreamExt;
use std::{error::Error, sync::Arc};

use crate::{
    config::Settings,
    database::{DatabasePool, TransactionEvent},
};

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
        Ok(Self { provider })
    }

    pub async fn fetch(
        &self,
        contract_address: Address,
        pool: DatabasePool,
    ) -> Result<(), Box<dyn Error>> {
        let filter = Filter::new()
            .address(contract_address)
            // .event("Transfer(address indexed,address indexed,uint256)")
            .from_block(BlockNumberOrTag::Latest);

        print!(
            "Subscribing to {} contract logs...",
            contract_address.to_string()
        );
        let sub = self.provider.subscribe_logs(&filter).await?;
        println!(": SUCCESS !");
        let mut stream = sub.into_stream();

        while let Some(log) = stream.next().await {
            match log.topic0() {
                Some(&USDT::Transfer::SIGNATURE_HASH) => {
                    println!(
                        "Hash :\t{}",
                        log.transaction_hash
                            .ok_or("Not existing transaction hash")?
                            .to_string()
                            .bold()
                    );
                    let USDT::Transfer {
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
                    let transaction = TransactionEvent {
                        transaction_hash: log.transaction_hash.unwrap().to_string(),
                        from_address: from.to_string(),
                        to_address: to.to_string(),
                        value: value.to::<i64>(),
                        gas_used: 0,
                        block_number: i64::try_from(log.block_number.unwrap()).unwrap(),
                    };

                    pool.add_transaction(transaction).await?;
                    println!();
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
