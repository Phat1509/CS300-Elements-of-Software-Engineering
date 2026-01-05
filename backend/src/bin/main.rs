use loco_rs::cli;
use migration::Migrator;
use shoes_store_api::app::App;

#[tokio::main]
async fn main() -> loco_rs::Result<()> {
    dotenvy::dotenv().ok();
    cli::main::<App, Migrator>().await
}
