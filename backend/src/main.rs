use std::env;
use std::sync::Arc;

use axum::Json;
use axum::Router;
use axum::extract::{Query, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
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

use utoipa_swagger_ui::SwaggerUi;

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
    let app = Router::new()
        .merge(SwaggerUi::new("/swagger-ui").url("/api-doc/openapi.json", ApiDoc::openapi()))
        .nest("/api", app_routes);
    tracing::info!("Routes Initizalized !");

    tracing::info!("Server listening on http://localhost:3000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;

    Ok(())
}

use utoipa::OpenApi;
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema)]
struct KYCRequest {
    wallet_address: String,
}

#[derive(utoipa::OpenApi)]
#[openapi(
    paths(check_wallet_kyc, add_wallet_kyc, remove_wallet_kyc, get_transaction),
    components(schemas(KYCRequest))
)]
struct ApiDoc;

struct AppError(anyhow::Error);

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        tracing::error!("Internal server error: {:?}", self.0);

        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Something went wrong".to_string(),
        )
            .into_response()
    }
}

impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}

fn api_router(shared_state: Arc<AppState>) -> Router {
    Router::new()
        .route(
            "/kyc",
            get(check_wallet_kyc)
                .post(add_wallet_kyc)
                .delete(remove_wallet_kyc),
        )
        .route("/transaction", get(get_transaction))
        .with_state(shared_state)
}

#[derive(Serialize, ToSchema)]
pub struct TransactionListReponse {
    total: u64,
    transactions: Vec<TransactionEvent>,
}

#[utoipa::path(
    get,
    path = "/api/kyc",
    params(
        ("wallet_address" = String, Query, description = "Wallet to check KYC")
    ),
    responses(
        (status = 200, description = "KYC status", body = bool)
    )
)]
async fn check_wallet_kyc(
    Query(payload): Query<KYCRequest>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<bool>, AppError> {
    let kyc_state = state.1.check_kyc(&payload.wallet_address).await?;
    tracing::info!("Check {:?} from KYC", payload.wallet_address);
    Ok(Json(kyc_state))
}

#[utoipa::path(
    post,
    path = "/api/kyc",
    request_body = KYCRequest,
    responses(
        (status = 201, description = "Wallet added to KYC")
    )
)]
async fn add_wallet_kyc(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<KYCRequest>,
) -> Result<StatusCode, AppError> {
    let _ = state.1.add_kyc(&payload.wallet_address).await?;
    tracing::info!("{:?}", payload.wallet_address);
    Ok(StatusCode::CREATED)
}

#[utoipa::path(
    delete,
    path = "/api/kyc",
    params(
        ("wallet_address" = String, Query, description = "Wallet to remove from KYC")
    ),
    responses(
        (status = 204, description = "Wallet removed from KYC")
    )
)]
async fn remove_wallet_kyc(
    Query(payload): Query<KYCRequest>,
    State(state): State<Arc<AppState>>,
) -> Result<StatusCode, AppError> {
    let _ = state.1.remove_kyc(&payload.wallet_address).await?;
    tracing::info!("Remove {:?} from KYC", payload.wallet_address);
    Ok(StatusCode::NO_CONTENT)
}

#[utoipa::path(
    get,
    path = "/api/transaction",
    params(
        ("transaction_address" = Option<String>, Query, description = "Transaction address to query transactions"),
        ("contract_address" = Option<String>, Query, description = "Wallet address to query contract"),
        ("limit" = Option<u32>, Query, description = "Optional limit for number of results"),
        ("pagination" = Option<u32>, Query, description = "Optional pagination for chunk of limited number of results"),
        ("from" = Option<String>, Query, description = "Optional 'from' in the transaction"),
        ("to" = Option<String>, Query, description = "Optional 'to' in the transaction"),
    ),
    responses(
        (status = 200, description = "Transactions retrieved", body = [TransactionListReponse]),
        (status = 502, description = "Error fetching transactions")
    )
)]
async fn get_transaction(
    Query(params): Query<TransactionParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<TransactionListReponse>, (StatusCode, String)> {
    match state.0.get_transaction(&params).await {
        Ok((count, transactions)) => Ok(Json(TransactionListReponse {
            total: count,
            transactions: transactions,
        })),
        Err(e) => Err((
            StatusCode::BAD_GATEWAY,
            format!("Error while retrieving transaction {e:?}"),
        )),
    }
}
