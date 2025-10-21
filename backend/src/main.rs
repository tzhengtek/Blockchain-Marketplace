use std::env;
use std::sync::Arc;

use axum::Json;
use axum::Router;
use axum::extract::{Query, State};
use axum::http::StatusCode;
use axum::routing::get;
use database::TransactionEvent;
use serde::{Deserialize, Serialize};
use tracing_subscriber::filter::EnvFilter;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::{fmt, layer::SubscriberExt};

use anyhow::{Error, Result};
use database::{DatabasePool, TransactionParams};
use dotenv::dotenv;
use indexer::{BlockchainIndexer, Settings};

#[derive(Clone)]
struct AppState(DatabasePool, BlockchainIndexer);

impl From<(DatabasePool, BlockchainIndexer)> for AppState {
    fn from(values: (DatabasePool, BlockchainIndexer)) -> Self {
        Self(values.0, values.1)
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::registry()
        .with(fmt::layer())
        .with(EnvFilter::from_default_env())
        .init();
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").map_err(Error::msg)?;
    let settings = Settings::load().map_err(|e| Error::msg(e))?;

    println!("{:?}", settings);

    let indexer = BlockchainIndexer::new(&settings).await?;

    let pool = DatabasePool::new(&database_url).await?;
    let shared_state = Arc::new(AppState(pool, indexer));

    tracing::info!("Routes Initialization...");
    let app_routes = api_router(shared_state);
    let app = Router::new().nest("/api", app_routes);
    tracing::info!("Routes Initizalized !");

    tracing::info!("Server listening on http://localhost:3000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;

    Ok(())
}

#[derive(Deserialize, Serialize)]
struct KYCRequest {
    wallet_address: String,
}

fn api_router(shared_state: Arc<AppState>) -> Router {
    Router::new()
        .route("/verify", get(verify_kyc))
        .route("/transaction", get(get_transaction))
        .with_state(shared_state)
}

async fn verify_kyc(Query(payload): Query<KYCRequest>, State(state): State<Arc<AppState>>) {
    let _ = state.1.add_kyc(&payload.wallet_address).await;
    tracing::info!("{:?}", payload.wallet_address);
}

async fn get_transaction(
    Query(params): Query<TransactionParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<TransactionEvent>>, (StatusCode, String)> {
    match state.0.get_transaction(&params).await {
        Ok(res) => Ok(Json(res)),
        Err(e) => Err((
            StatusCode::BAD_GATEWAY,
            format!("Error while retrieving transaction {e:?}"),
        )),
    }
}
