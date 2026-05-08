use dotenvy::dotenv;
use std::env;

pub struct Config {
    pub database_url: String,
    pub redis_url: String,
    pub encryption_key: String,
}

impl Config {
    pub fn from_env() -> Self {
        dotenv().ok();
        Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            redis_url: env::var("REDIS_URL").expect("REDIS_URL must be set"),
            encryption_key: env::var("ENCRYPTION_KEY").expect("ENCRYPTION_KEY must be set"),
        }
    }
}
