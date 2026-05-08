use lazy_static::lazy_static;
use prometheus::{opts, register_counter_vec, register_histogram_vec, CounterVec, HistogramVec};

lazy_static! {
    pub static ref INTENTS_PROCESSED: CounterVec = register_counter_vec!(
        opts!(
            "wch_executor_intents_processed_total",
            "Total number of order intents processed"
        ),
        &["result"]
    )
    .unwrap();
    pub static ref ORDERS_CREATED: CounterVec = register_counter_vec!(
        opts!(
            "wch_executor_orders_created_total",
            "Total number of orders created"
        ),
        &["mode"]
    )
    .unwrap();
    pub static ref EXECUTIONS_COMPLETED: CounterVec = register_counter_vec!(
        opts!(
            "wch_executor_executions_completed_total",
            "Total number of executions completed"
        ),
        &["mode", "status"]
    )
    .unwrap();
    pub static ref RISK_VIOLATIONS: CounterVec = register_counter_vec!(
        opts!(
            "wch_executor_risk_violations_total",
            "Total number of risk engine violations"
        ),
        &["reason"]
    )
    .unwrap();
    pub static ref INTENT_PROCESSING_DURATION: HistogramVec = register_histogram_vec!(
        "wch_executor_intent_processing_duration_seconds",
        "Duration of order intent processing",
        &["result"],
        vec![0.01, 0.05, 0.1, 0.5, 1.0, 2.5, 5.0, 10.0]
    )
    .unwrap();
}
