#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_openapi::prelude::{routes, OpenApiRouter};
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::{
    controllers::{forbidden, ErrorDetail},
    models::{
        _entities::product_variants::{Column, Entity},
        product_variants::{ActiveModel, Model},
        users,
    },
};

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ProductVariantCreateParams {
    pub color: Option<String>,
    pub size: Option<String>,
    pub stock: u32,
    pub sku: String,
}

impl ProductVariantCreateParams {
    fn update(&self, item: &mut ActiveModel) -> Result<()> {
        item.color = Set(self.color.clone());
        item.size = Set(self.size.clone());
        item.stock = Set(self
            .stock
            .try_into()
            .map_err(|_| Error::BadRequest("Product stock too large".to_string()))?);
        item.sku = Set(self.sku.clone());

        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ProductVariantUpdateParams {
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    pub color: Option<Option<String>>,

    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    pub size: Option<Option<String>>,

    #[serde(default)]
    pub stock: Option<u32>,

    #[serde(default)]
    pub sku: Option<String>,
}

impl ProductVariantUpdateParams {
    fn update(&self, item: &mut ActiveModel) -> Result<()> {
        if let Some(ref color) = self.color {
            item.color = Set(color.clone());
        }

        if let Some(ref size) = self.size {
            item.size = Set(size.clone());
        }

        if let Some(stock) = self.stock {
            item.stock = Set(stock
                .try_into()
                .map_err(|_| Error::BadRequest("Product stock too large".to_string()))?);
        }

        if let Some(ref sku) = self.sku {
            item.sku = Set(sku.clone());
        }

        Ok(())
    }
}

async fn load_item(ctx: &AppContext, product_id: i32, id: i32) -> Result<Model> {
    let item = Entity::find_by_id(id)
        .filter(Column::ProductId.eq(product_id))
        .one(&ctx.db)
        .await?;
    item.ok_or_else(|| Error::NotFound)
}

#[utoipa::path(
    get,
    path = "/api/products/{product_id}/variants",
    tags = ["Products"],
    summary = "List product variants",
    responses(
        (status = OK, description = "Product variants", body = Vec<Model>),
    )
)]
#[debug_handler]
pub async fn list(Path(product_id): Path<i32>, State(ctx): State<AppContext>) -> Result<Response> {
    let variants = Entity::find()
        .filter(Column::ProductId.eq(product_id))
        .all(&ctx.db)
        .await?;

    format::json(variants)
}

#[utoipa::path(
    post,
    path = "/api/products/{product_id}/variants",
    tags = ["Products"],
    summary = "Create product variant",
    responses(
        (status = OK, description = "Created product variant", body = Model),
        (status = UNAUTHORIZED, description = "Not authenticated", body = ErrorDetail),
        (status = FORBIDDEN, description = "Insufficient permissions", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn add(
    auth: auth::JWTWithUser<users::Model>,
    Path(product_id): Path<i32>,
    State(ctx): State<AppContext>,
    Json(params): Json<ProductVariantCreateParams>,
) -> Result<Response> {
    if !auth.user.is_staff {
        return forbidden("You are not authorized to perform this action.");
    }

    let mut item = ActiveModel {
        product_id: Set(product_id),
        ..Default::default()
    };

    params.update(&mut item)?;
    format::json(item.insert(&ctx.db).await?)
}

#[utoipa::path(
    get,
    path = "/api/products/{product_id}/variants/{id}",
    tags = ["Products"],
    summary = "Get product variant",
    responses(
        (status = OK, description = "Product variant", body = Model),
    )
)]
#[debug_handler]
pub async fn get_one(
    Path((product_id, id)): Path<(i32, i32)>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    format::json(load_item(&ctx, product_id, id).await?)
}

#[utoipa::path(
    delete,
    path = "/api/products/{product_id}/variants/{id}",
    tags = ["Products"],
    summary = "Delete product variant",
    responses(
        (status = OK, description = "Product variant deleted"),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = FORBIDDEN, description = "Forbidden", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn remove(
    auth: auth::JWTWithUser<users::Model>,
    Path((product_id, id)): Path<(i32, i32)>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    if !auth.user.is_staff {
        return forbidden("You are not authorized to perform this action.");
    }

    load_item(&ctx, product_id, id)
        .await?
        .delete(&ctx.db)
        .await?;

    format::empty()
}

#[utoipa::path(
    patch,
    path = "/api/products/{product_id}/variants/{id}",
    tags = ["Products"],
    summary = "Update product variant",
    responses(
        (status = OK, description = "Product variant", body = Model),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = FORBIDDEN, description = "Forbidden", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn update(
    auth: auth::JWTWithUser<users::Model>,
    Path((product_id, id)): Path<(i32, i32)>,
    State(ctx): State<AppContext>,
    Json(params): Json<ProductVariantUpdateParams>,
) -> Result<Response> {
    if !auth.user.is_staff {
        return forbidden("You are not authorized to perform this action.");
    }

    let item = load_item(&ctx, product_id, id).await?;
    let mut item = item.into_active_model();

    params.update(&mut item)?;

    format::json(item.update(&ctx.db).await?)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/products/{product_id}/variants")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
}

pub fn api_routes() -> OpenApiRouter<AppContext> {
    OpenApiRouter::new()
        .routes(routes!(list, add))
        .routes(routes!(get_one, remove, update))
}
