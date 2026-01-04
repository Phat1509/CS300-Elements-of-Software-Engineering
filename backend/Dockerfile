FROM beerpsi/cargo-chef-musl-mimalloc:1.88.0-stable AS chef
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --target x86_64-unknown-linux-musl --recipe-path recipe.json
COPY . .
RUN cargo build --release --target x86_64-unknown-linux-musl

FROM gcr.io/distroless/static AS runtime
WORKDIR /app
VOLUME /app/config
COPY --from=builder --chown=nonroot:nonroot /app/target/x86_64-unknown-linux-musl/release/shoes_store_api-cli /app/
USER nonroot
CMD ["/app/shoes_store_api-cli", "start", "--environment", "production"]
