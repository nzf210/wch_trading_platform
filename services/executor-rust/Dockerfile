FROM rust:slim
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY Cargo.toml ./
COPY src ./src
RUN cargo build --release
CMD ["./target/release/executor-rust"]
