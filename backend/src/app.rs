use std::path::Path;

use async_trait::async_trait;
use loco_openapi::auth::{set_jwt_location, SecurityAddon};
use loco_rs::{
    app::{AppContext, Hooks, Initializer},
    bgworker::{BackgroundWorker, Queue},
    boot::{create_app, BootResult, StartMode},
    config::Config,
    controller::AppRoutes,
    db::{self, truncate_table},
    environment::Environment,
    task::Tasks,
    Result,
};
use utoipa::OpenApi;

use migration::Migrator;

#[allow(unused_imports)]
use crate::{controllers, models::_entities::users, tasks, workers::downloader::DownloadWorker};

pub struct App;
#[async_trait]
impl Hooks for App {
    fn app_name() -> &'static str {
        env!("CARGO_CRATE_NAME")
    }

    fn app_version() -> String {
        format!(
            "{} ({})",
            env!("CARGO_PKG_VERSION"),
            option_env!("BUILD_SHA")
                .or(option_env!("GITHUB_SHA"))
                .unwrap_or("dev")
        )
    }

    async fn boot(
        mode: StartMode,
        environment: &Environment,
        config: Config,
    ) -> Result<BootResult> {
        create_app::<Self, Migrator>(mode, environment, config).await
    }

    async fn initializers(_ctx: &AppContext) -> Result<Vec<Box<dyn Initializer>>> {
        Ok(vec![Box::new(
            loco_openapi::OpenapiInitializerWithSetup::new(
                |ctx| {
                    #[derive(OpenApi)]
                    #[openapi(modifiers(&SecurityAddon), info(title = "Shoes Store API"))]
                    struct ApiDoc;

                    set_jwt_location(ctx.into());
                    ApiDoc::openapi()
                },
                Some(vec![
                    controllers::auth::api_routes(),
                    controllers::brands::api_routes(),
                    controllers::cart_items::api_routes(),
                    controllers::categories::api_routes(),
                    controllers::orders::api_routes(),
                    controllers::products::api_routes(),
                    controllers::product_variants::api_routes(),
                    controllers::reviews::api_routes(),
                    controllers::wishlists::api_routes(),
                ]),
            ),
        )])
    }

    fn routes(_ctx: &AppContext) -> AppRoutes {
        AppRoutes::with_default_routes() // controller routes below
            .add_route(controllers::orders::routes())
            .add_route(controllers::wishlists::routes())
            .add_route(controllers::reviews::routes())
            .add_route(controllers::cart_items::routes())
            .add_route(controllers::categories::routes())
            .add_route(controllers::brands::routes())
            .add_route(controllers::product_variants::routes())
            .add_route(controllers::products::routes())
            .add_route(controllers::auth::routes())
    }
    async fn connect_workers(ctx: &AppContext, queue: &Queue) -> Result<()> {
        queue.register(DownloadWorker::build(ctx)).await?;
        Ok(())
    }

    #[allow(unused_variables)]
    fn register_tasks(tasks: &mut Tasks) {
        // tasks-inject (do not remove)
    }
    async fn truncate(ctx: &AppContext) -> Result<()> {
        truncate_table(&ctx.db, users::Entity).await?;
        Ok(())
    }
    async fn seed(ctx: &AppContext, base: &Path) -> Result<()> {
        macro_rules! seed {
            ($table:ident) => {
                db::seed::<$crate::models::$table::ActiveModel>(
                    &ctx.db,
                    &base
                        .join(concat!(stringify!($table), ".yaml"))
                        .display()
                        .to_string(),
                )
                .await?;
            };
        }

        seed!(users);
        seed!(brands);
        seed!(categories);
        seed!(products);
        seed!(product_variants);
        seed!(cart_items);
        seed!(orders);
        seed!(order_items);
        seed!(reviews);
        seed!(wishlists);

        Ok(())
    }
}
