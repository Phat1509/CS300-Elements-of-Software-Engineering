#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_openapi::prelude::{routes, OpenApiRouter};
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::{
    controllers::ErrorDetail,
    models::{
        _entities::cart_items::{Column, Entity},
        cart_items::ActiveModel,
        product_variants, products, users,
    },
    views::cart_items::CartItem,
};

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct CartItemCreateParams {
    product_variant_id: i32,
    quantity: i32,
}

impl CartItemCreateParams {
    const fn update(&self, item: &mut ActiveModel) {
        item.product_variant_id = Set(self.product_variant_id);
        item.quantity = Set(Some(self.quantity));
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct CartItemUpdateParams {
    quantity: i32,
}

impl CartItemUpdateParams {
    const fn update(&self, item: &mut ActiveModel) {
        item.quantity = Set(Some(self.quantity));
    }
}

#[utoipa::path(
    get,
    path = "/api/cart",
    tags = ["Cart"],
    summary = "Get cart items",
    responses(
        (status = OK, description = "Retrieved cart items", body = Vec<CartItem>),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn list(
    auth: auth::JWTWithUser<users::Model>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let result = Entity::find()
        .filter(Column::UserId.eq(auth.user.id))
        .find_also_related(product_variants::Entity)
        .and_also_related(products::Entity)
        .all(&ctx.db)
        .await?
        .into_iter()
        .map(|(cart_item, product_variant, product)| CartItem {
            cart_item,
            product,
            product_variant,
        })
        .collect::<Vec<_>>();

    format::json(result)
}

#[utoipa::path(
    post,
    path = "/api/cart",
    tags = ["Cart"],
    summary = "Add item to cart",
    responses(
        (status = OK, description = "Added item to cart", body = CartItem),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = NOT_FOUND, description = "Product not found", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn add(
    auth: auth::JWTWithUser<users::Model>,
    State(ctx): State<AppContext>,
    Json(params): Json<CartItemCreateParams>,
) -> Result<Response> {
    let product_variant = product_variants::Entity::find_by_id(params.product_variant_id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;
    let product = products::Entity::find_by_id(product_variant.product_id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let mut item = ActiveModel {
        user_id: Set(auth.user.id),
        ..Default::default()
    };

    params.update(&mut item);

    let cart_item = item.insert(&ctx.db).await?;

    format::json(CartItem {
        cart_item,
        product_variant: Some(product_variant),
        product: Some(product),
    })
}

#[utoipa::path(
    get,
    path = "/api/cart/{product_variant_id}",
    tags = ["Cart"],
    summary = "Get cart item by product variant ID",
    responses(
        (status = OK, description = "Retrieved cart item", body = CartItem),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = NOT_FOUND, description = "Item not found in cart", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn get_one(
    auth: auth::JWTWithUser<users::Model>,
    Path(product_variant_id): Path<i32>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let (cart_item, product_variant, product) = Entity::find()
        .filter(
            Column::UserId
                .eq(auth.user.id)
                .and(Column::ProductVariantId.eq(product_variant_id)),
        )
        .find_also_related(product_variants::Entity)
        .and_also_related(products::Entity)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    format::json(CartItem {
        cart_item,
        product,
        product_variant,
    })
}

#[utoipa::path(
    delete,
    path = "/api/cart/{product_variant_id}",
    tags = ["Cart"],
    summary = "Remove item from cart",
    responses(
        (status = OK, description = "Removed item from cart"),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn remove(
    auth: auth::JWTWithUser<users::Model>,
    Path(product_variant_id): Path<i32>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    Entity::delete_many()
        .filter(Column::UserId.eq(auth.user.id))
        .filter(Column::ProductVariantId.eq(product_variant_id))
        .exec(&ctx.db)
        .await?;

    format::empty()
}

#[utoipa::path(
    patch,
    path = "/api/cart/{product_variant_id}",
    tags = ["Cart"],
    summary = "Update cart item",
    responses(
        (status = OK, description = "Updated cart item", body = CartItem),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = NOT_FOUND, description = "Cart item not found", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn update(
    auth: auth::JWTWithUser<users::Model>,
    Path(product_variant_id): Path<i32>,
    State(ctx): State<AppContext>,
    Json(params): Json<CartItemUpdateParams>,
) -> Result<Response> {
    let item = Entity::find()
        .filter(
            Column::UserId
                .eq(auth.user.id)
                .and(Column::ProductVariantId.eq(product_variant_id)),
        )
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;
    let mut item = item.into_active_model();

    params.update(&mut item);

    let cart_item = item.update(&ctx.db).await?;
    let (product_variant, product) = if let Some((product_variant, product)) =
        product_variants::Entity::find_by_id(product_variant_id)
            .find_also_related(products::Entity)
            .one(&ctx.db)
            .await?
    {
        (Some(product_variant), product)
    } else {
        (None, None)
    };

    format::json(CartItem {
        cart_item,
        product,
        product_variant,
    })
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/cart/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{product_variant_id}", get(get_one))
        .add("{product_variant_id}", delete(remove))
        .add("{product_variant_id}", patch(update))
}

pub fn api_routes() -> OpenApiRouter<AppContext> {
    OpenApiRouter::new()
        .routes(routes!(list))
        .routes(routes!(add))
        .routes(routes!(get_one))
        .routes(routes!(remove))
        .routes(routes!(update))
}
