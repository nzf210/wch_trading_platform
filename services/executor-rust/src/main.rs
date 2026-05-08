mod app;
mod config;
mod exchange;
mod execution;
mod metrics;
mod postgres;
mod redis;
mod risk;
mod security;
mod types;

use crate::app::App;
use crate::config::Config;
use crate::execution::Reconciler;
use crate::redis as internal_redis;
use prometheus::{Encoder, TextEncoder};
use std::sync::Arc;
use tracing::{error, info};
use tracing_subscriber::prelude::*;
use tracing_subscriber::{fmt, EnvFilter};
use warp::Filter;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .with(fmt::layer().json())
        .init();

    info!("Starting executor-rust...");
    let config = Config::from_env();

    let app = Arc::new(
        App::new(
            &config.database_url,
            &config.redis_url,
            &config.encryption_key,
        )
        .await?,
    );
    info!("Connected to database");

    // Start Metrics Server
    tokio::spawn(async move {
        let health_route = warp::path("health").map(|| {
            warp::reply::with_status(
                warp::reply::json(&serde_json::json!({"status":"ok","service":"executor-rust"})),
                warp::http::StatusCode::OK,
            )
        });

        let metrics_route = warp::path("metrics").map(|| {
            let mut buffer = Vec::new();
            let encoder = TextEncoder::new();
            let metric_families = prometheus::gather();
            encoder.encode(&metric_families, &mut buffer).unwrap();
            String::from_utf8(buffer).unwrap()
        });

        let routes = health_route.or(metrics_route);

        info!("Metrics/health server starting on 0.0.0.0:9090");
        warp::serve(routes).run(([0, 0, 0, 0], 9090)).await;
    });

    // Start Redis consumers
    let order_app = Arc::clone(&app);
    let event_app = Arc::clone(&app);
    let redis_url = config.redis_url.clone();
    let redis_url_2 = config.redis_url.clone();

    tokio::spawn(async move {
        if let Err(e) =
            internal_redis::consumer::start_order_intent_consumer(order_app, &redis_url).await
        {
            error!("Order intent consumer error: {:?}", e);
        }
    });

    tokio::spawn(async move {
        if let Err(e) =
            internal_redis::consumer::start_event_consumer(event_app, &redis_url_2).await
        {
            error!("Event consumer error: {:?}", e);
        }
    });

    // Start Reconciliation Loop
    let recon_pool = app.db.pool.clone();
    let recon_key = config.encryption_key.clone();
    tokio::spawn(async move {
        let reconciler = Reconciler::new(recon_pool, recon_key);
        reconciler.run().await;
    });

    // Start Risk Monitor Loop
    let monitor_pool = app.db.pool.clone();
    let monitor_key = config.encryption_key.clone();
    tokio::spawn(async move {
        let risk_monitor = risk::RiskMonitor::new(monitor_pool, monitor_key);
        risk_monitor.run().await;
    });

    info!("Executor ready to process orders and reconcile state");

    // Keep alive
    tokio::signal::ctrl_c().await?;
    info!("Shutting down executor...");

    Ok(())
}
