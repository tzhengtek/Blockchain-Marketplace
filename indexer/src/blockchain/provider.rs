use alloy::{
    eips::BlockNumberOrTag,
    providers::{
        Identity, Provider, ProviderBuilder, RootProvider, WsConnect,
        fillers::{
            BlobGasFiller, ChainIdFiller, FillProvider, GasFiller, JoinFill, NonceFiller,
            WalletFiller,
        },
    },
    rpc::types::Filter,
    sol,
    sol_types::SolEvent,
};

use std::str::FromStr;

sol! {
    #[allow(missing_docs)]
    #[sol(rpc)]
    BEP20,
    "examples/abi/BEP20.json",
}

sol! {
    #[allow(missing_docs)]
    #[sol(rpc)]
    KYC,
    "examples/abi/KYC.json",
}

use colored::Colorize;

use futures_util::StreamExt;

use crate::config::{ContractSettings, Settings};
use anyhow::{Error, Result, anyhow};
use database::{DatabasePool, TransactionEvent};

use alloy::network::EthereumWallet;
use alloy::signers::local::PrivateKeySigner;

use alloy_primitives::Address;

#[derive(Clone)]
pub struct BlockchainIndexer {
    provider: FillProvider<
        JoinFill<
            JoinFill<
                Identity,
                JoinFill<GasFiller, JoinFill<BlobGasFiller, JoinFill<NonceFiller, ChainIdFiller>>>,
            >,
            WalletFiller<EthereumWallet>,
        >,
        RootProvider,
    >,
    kyc_contract: KYC::KYCInstance<
        FillProvider<
            JoinFill<
                JoinFill<
                    Identity,
                    JoinFill<
                        GasFiller,
                        JoinFill<BlobGasFiller, JoinFill<NonceFiller, ChainIdFiller>>,
                    >,
                >,
                WalletFiller<EthereumWallet>,
            >,
            RootProvider,
        >,
    >,
}

impl BlockchainIndexer {
    pub async fn new(settings: &Settings) -> Result<Self, Error> {
        tracing::info!("Connection to node...");
        let ws = WsConnect::new(&settings.blockchain.ws_url);
        let private_key = &settings.wallet_private_key;
        let signer: PrivateKeySigner = private_key.parse()?;
        let wallet = EthereumWallet::from(signer);
        let provider = ProviderBuilder::default()
            .with_gas_estimation()
            .wallet(wallet)
            .connect_ws(ws)
            .await?;
        let kyc_contract = KYC::new(settings.contract.kyc_address, provider.clone());
        tracing::info!(": SUCCESS !");
        Ok(Self {
            provider,
            kyc_contract,
        })
    }

    pub async fn check_kyc(&self, address: Address) -> Result<()> {
        tracing::info!("Checking the address KYC...");
        let val = self.kyc_contract.isKYCVerified(address).call().await?;
        tracing::debug!("CHECK KYC : {val:?}");
        Ok(())
    }

    pub async fn add_kyc(&self, user_address: &String) -> Result<()> {
        let user_address = Address::from_str(&user_address)
            .map_err(|_| Error::msg("Error while converting address"))?;

        tracing::info!("Adding address to KYC...");
        let pending_tx = self.kyc_contract.addKYC(user_address).send().await;

        // // Log transaction hash immediately
        // let tx_hash = pending_tx.tx_hash();
        // tracing::info!("Transaction sent! Hash: {:?}", tx_hash);
        //
        // // Wait for transaction to be mined
        // let receipt = pending_tx.get_receipt().await?;
        // if let Some(logs) = &receipt.logs {
        //     if !logs.is_empty() {
        //         tracing::info!("✅ Transaction emitted logs! Looks successful.");
        //     } else {
        //         tracing::warn!(
        //             "Transaction mined but no logs found — might have reverted silently."
        //         );
        //     }
        // }
        // let receipt = pending_tx.get_receipt().await?;
        // tracing::info!(
        //     "✅ Transaction mined! Hash: {:?}-{:?}",
        //     receipt.transaction_hash,
        //     receipt.from
        // );

        // let tx_hash = pending_tx.tx_hash();
        // tracing::info!("Transaction sent! Hash: {:?}", tx_hash);
        Ok(())
    }

    pub async fn remove_kyc(&self, user_address: &String) -> Result<()> {
        let user_address = Address::from_str(&user_address)
            .map_err(|_| Error::msg("Error while converting address"))?;
        tracing::info!("ADDRESS {:?}", user_address);

        tracing::info!("Remove address to KYC...");
        let pending_tx = self.kyc_contract.revokeKYC(user_address).send().await?;
        let receipt = pending_tx.get_receipt().await?; // wait until mined
        // let receipt = pending_tx.get_receipt().await?;
        // tracing::info!(
        //     "✅ Transaction mined! Hash: {:?} - {:?}",
        //     receipt.transaction_hash,
        //     receipt.from
        // );
        Ok(())
    }

    pub async fn fetch(
        &self,
        contracts_settings: ContractSettings,
        pool: DatabasePool,
    ) -> Result<()> {
        let addresses = vec![
            contracts_settings.token_address,
            contracts_settings.nft_address,
            contracts_settings.kyc_address,
        ];

        let filter = Filter::new()
            .address(addresses)
            .event("Transfer(address,address,uint256)")
            .from_block(BlockNumberOrTag::Latest);

        tracing::info!("Subscribing to contract logs...",);
        let sub = self.provider.subscribe_logs(&filter).await?;
        tracing::info!(": SUCCESS !");
        let mut stream = sub.into_stream();

        while let Some(log) = stream.next().await {
            let contract_address = match contracts_settings.identify_contract(log.address()) {
                Some(address) => Ok(address),
                None => Err(anyhow!("Not a existing contract")),
            };
            match log.topic0() {
                Some(&BEP20::Transfer::SIGNATURE_HASH) => {
                    tracing::info!(
                        "Hash :\t{}",
                        log.transaction_hash
                            .ok_or(Error::msg("Not existing transaction hash"))?
                            .to_string()
                            .bold()
                    );
                    let BEP20::Transfer {
                        from, to, value, ..
                    } = log.log_decode()?.inner.data;
                    tracing::debug!("{}", format!("From :\t{}", from).bold());
                    tracing::debug!("{}", format!("To :\t{}", to).bold());
                    tracing::debug!("{}", format!("Value :\t{}", value).bold());
                    tracing::debug!(
                        "Block Number : {}",
                        log.block_number
                            .ok_or(Error::msg("Not existing block number"))?
                            .to_string()
                            .bold()
                    );
                    let block_number: u64 = log
                        .block_number
                        .ok_or_else(|| Error::msg("Block number is missing"))?;
                    tracing::debug!("BLOCK : {}", block_number);
                    let block_id = pool.add_block(block_number).await?;
                    let transaction = TransactionEvent {
                        transaction_hash: log
                            .transaction_hash
                            .ok_or(Error::msg("Not existing transaction hash"))?
                            .to_string(),
                        from_address: from.to_string(),
                        to_address: to.to_string(),
                        value: value.to_string(),
                        block_id: block_id,
                        contract_address: contract_address?,
                        timestamp: None,
                    };
                    pool.add_transaction(transaction).await?;
                }

                _ => {
                    tracing::info!("Not a Transfer Event !");
                    tracing::debug!(
                        "Block Number : {}",
                        log.block_number
                            .ok_or(Error::msg("Not existing block number"))?
                            .to_string()
                            .bold()
                    );
                }
            }
        }
        Ok(())
    }
}
