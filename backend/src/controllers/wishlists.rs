#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_openapi::prelude::{routes, OpenApiRouter};
use loco_rs::prelude::*;
use sea_orm::{sea_query, QueryOrder};

use crate::{
    controllers::ErrorDetail,
    models::{
        _entities::{brands, categories, products, wishlists::Column},
        users,
        wishlists::{ActiveModel, Entity},
    },
    views::products::Product,
};

#[utoipa::path(
    get,
    path = "/api/wishlist",
    tags = ["Wishlist"],
    summary = "List products in wishlist",
    responses(
        (status = OK, description = "Retrieved wishlist", body = Vec<Product>),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn list(
    auth: auth::JWTWithUser<users::Model>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let results = products::Entity::find()
        .filter(
            products::Column::Id.in_subquery(
                sea_query::Query::select()
                    .column(Column::ProductId)
                    .from(Entity)
                    .and_where(Column::UserId.eq(auth.user.id))
                    .to_owned(),
            ),
        )
        .find_also_related(brands::Entity)
        .find_also_related(categories::Entity)
        .order_by_desc(products::Column::UpdatedAt)
        .order_by_asc(products::Column::Id)
        .all(&ctx.db)
        .await?
        .into_iter()
        .map(|(product, brand, category)| Product {
            product,
            brand,
            category,
            variants: None,
        })
        .collect::<Vec<_>>();

    format::json(results)
}

#[utoipa::path(
    post,
    path = "/api/products/{product_id}/wishlist",
    tags = ["Wishlist"],
    summary = "Add product to wishlist",
    responses(
        (status = OK, description = "Added to wishlist"),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
    )
)]
pub async fn add(
    auth: auth::JWTWithUser<users::Model>,
    Path(product_id): Path<i32>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let _ = products::Entity::find_by_id(product_id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;
    if (Entity::find()
        .filter(
            Column::UserId
                .eq(auth.user.id)
                .and(Column::ProductId.eq(product_id)),
        )
        .one(&ctx.db)
        .await?)
        .is_some()
    {
        return format::empty();
    }

    let item = ActiveModel {
        user_id: Set(auth.user.id),
        product_id: Set(product_id),
        ..Default::default()
    };

    item.insert(&ctx.db).await?;

    format::empty()
}

#[utoipa::path(
    delete,
    path = "/api/products/{product_id}/wishlist",
    tags = ["Wishlist"],
    summary = "Remove product from wishlist",
    responses(
        (status = OK, description = "Removed from wishlist"),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
    )
)]
pub async fn remove(
    auth: auth::JWTWithUser<users::Model>,
    Path(product_id): Path<i32>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    Entity::delete_many()
        .filter(
            Column::UserId
                .eq(auth.user.id)
                .and(Column::ProductId.eq(product_id)),
        )
        .exec(&ctx.db)
        .await?;

    format::empty()
}

pub fn routes() -> Routes {
    Routes::new()
        .add("/api/wishlist", get(list))
        .add("/api/products/{product_id}/wishlist", post(add))
        .add("/api/products/{product_id}/wishlist", delete(remove))
}

pub fn api_routes() -> OpenApiRouter<AppContext> {
    OpenApiRouter::new()
        .routes(routes!(list))
        .routes(routes!(add, remove))
}
