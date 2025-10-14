use axum::routing::post;
use axum::{Router, routing::get};
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::{fmt, layer::SubscriberExt};
use tracing_subscriber::filter::EnvFilter;
use axum::{body::Bytes, http::StatusCode};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(fmt::layer())
        .with(EnvFilter::from_default_env())
        .init();

    tracing::info!("Routes Initialization...");
    let app_routes = api_router();
    let app = Router::new().nest("/api", app_routes);
    tracing::info!("Routes Initizalized !");

    tracing::info!("Server listening on http://localhost:3000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}


fn api_router() -> Router {
    Router::new()
        // `GET /` goes to `root`
        .route(
            "/",
            get(|| async {
                tracing::info!("Root route hit");
                "HellowWOrlds "
            }),
        ).route("/verify", post())
}


async fn 