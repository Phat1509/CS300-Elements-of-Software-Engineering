#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]

use loco_openapi::prelude::{routes, OpenApiRouter};
use loco_rs::prelude::*;
use rust_decimal::{dec, prelude::FromPrimitive};
use serde::{Deserialize, Serialize};

use crate::{
    controllers::{forbidden, ErrorDetail},
    models::{
        _entities::{
            order_items,
            orders::Column,
            product_variants,
            sea_orm_active_enums::{OrderStatus, PaymentMethod},
        },
        orders::{ActiveModel, Entity},
        users,
    },
    views::orders::Order,
};

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct OrderItemCreateParams {
    pub product_variant_id: i32,
    pub quantity: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct OrderCreateParams {
    pub payment_method: PaymentMethod,
    pub shipping_address: String,
    pub items: Vec<OrderItemCreateParams>,
}

#[utoipa::path(
    get,
    path = "/api/orders",
    tags = ["Orders"],
    summary = "List orders",
    responses(
        (status = OK, description = "Orders listed", body = Vec<Order>),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
    )
)]
#[debug_handler]
#[allow(clippy::needless_collect)] // seemingly does not work without collect
pub async fn list(
    auth: auth::JWTWithUser<users::Model>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let mut query = Entity::find().find_with_related(order_items::Entity);

    if !auth.user.is_staff {
        query = query.filter(Column::UserId.eq(auth.user.id))
    }

    let result = query.all(&ctx.db).await?;
    let variants = product_variants::Model::find_many_with_product(
        &ctx.db,
        result
            .iter()
            .flat_map(|(_, items)| items.iter().map(|item| item.product_variant_id))
            .collect::<Vec<i32>>(),
    )
    .await?;
    let result = result
        .into_iter()
        .map(|(order, items)| Order::create(order, items, &variants))
        .collect::<Vec<_>>();

    format::json(result)
}

#[utoipa::path(
    post,
    path = "/api/orders",
    tags = ["Orders"],
    summary = "Create order",
    responses(
        (status = OK, description = "Order created", body = Order),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = NOT_FOUND, description = "Product not found", body = ErrorDetail)
    )
)]
#[debug_handler]
#[allow(clippy::missing_panics_doc)]
pub async fn add(
    auth: auth::JWTWithUser<users::Model>,
    State(ctx): State<AppContext>,
    Json(params): Json<OrderCreateParams>,
) -> Result<Response> {
    if params.items.iter().any(|item| item.quantity <= 0) {
        return Err(Error::BadRequest(
            "Quantity must be greater than zero".to_string(),
        ));
    }

    let txn = ctx.db.begin().await?;

    let variants = product_variants::Model::find_many_with_product(
        &txn,
        params.items.iter().map(|item| item.product_variant_id),
    )
    .await?;

    // If any requested item does not exist, exit with NotFound
    if params.items.iter().any(|item| {
        let Some((_, product)) = variants.get(&item.product_variant_id) else {
            return true;
        };
        product.is_none()
    }) {
        return Err(Error::NotFound);
    }

    let order_total = params
        .items
        .iter()
        .map(|item| {
            let (_, product) = variants
                .get(&item.product_variant_id)
                .expect("already checked for existence above");
            let product = product
                .as_ref()
                .expect("already checked for existence above");

            Decimal::from_f64(product.price).expect("finite numbers should convert")
                * Decimal::from_i32(item.quantity).expect("integers can always be converted")
        })
        .fold(dec!(0), |acc, item| acc + item);

    let order = ActiveModel {
        user_id: Set(auth.user.id),
        status: Set(OrderStatus::Pending),
        amount: Set(order_total),
        payment_method: Set(params.payment_method),
        shipping_address: Set(Some(params.shipping_address.clone())),
        ..Default::default()
    };
    let order = order.insert(&txn).await?;
    let order_id = order.id;

    order_items::Entity::insert_many(params.items.iter().map(|item| {
        let (_, product) = variants
            .get(&item.product_variant_id)
            .expect("already checked for existence above");
        let product = product
            .as_ref()
            .expect("already checked for existence above");

        order_items::ActiveModel {
            order_id: Set(order.id),
            product_variant_id: Set(item.product_variant_id),
            quantity: Set(Some(item.quantity)),
            price: Set(Decimal::from_f64(product.price).expect("finite numbers should convert")),
            ..Default::default()
        }
    }))
    .exec(&txn)
    .await?;
    txn.commit().await?;

    format::json(Order::create(
        order,
        order_items::Entity::find()
            .filter(order_items::Column::OrderId.eq(order_id))
            .all(&ctx.db)
            .await?,
        &variants,
    ))
}

#[utoipa::path(
    get,
    path = "/api/orders/{id}",
    tags = ["Orders"],
    summary = "Get order by ID",
    responses(
        (status = OK, description = "Order retrieved", body = Order),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = FORBIDDEN, description = "Forbidden", body = ErrorDetail),
        (status = NOT_FOUND, description = "Order not found", body = ErrorDetail)
    )
)]
#[debug_handler]
pub async fn get_one(
    auth: auth::JWTWithUser<users::Model>,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let order = Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    if order.user_id != auth.user.id && !auth.user.is_staff {
        return forbidden("You are not authorized to view this item.");
    }

    let order_items = order.find_related(order_items::Entity).all(&ctx.db).await?;
    let variants = product_variants::Model::find_many_with_product(
        &ctx.db,
        order_items.iter().map(|item| item.product_variant_id),
    )
    .await?;

    format::json(Order::create(order, order_items, &variants))
}

#[utoipa::path(
    post,
    path = "/api/orders/{id}/cancel",
    tags = ["Orders"],
    summary = "Cancel order",
    responses(
        (status = OK, description = "Order cancelled"),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = FORBIDDEN, description = "Forbidden", body = ErrorDetail),
        (status = NOT_FOUND, description = "Order not found", body = ErrorDetail)
    )
)]
pub async fn cancel(
    auth: auth::JWTWithUser<users::Model>,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let order = Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    if auth.user.id != order.user_id && !auth.user.is_staff {
        return forbidden("You are not authorized to perform this action.");
    }

    if order.status != OrderStatus::Pending {
        return Err(Error::BadRequest(
            "Cannot cancel an ongoing order.".to_string(),
        ));
    }

    let mut order = order.into_active_model();

    order.status = Set(OrderStatus::Cancelled);
    order.update(&ctx.db).await?;

    format::empty()
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/orders/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}/cancel", post(cancel))
}

pub fn api_routes() -> OpenApiRouter<AppContext> {
    OpenApiRouter::new()
        .routes(routes!(list, add))
        .routes(routes!(get_one))
        .routes(routes!(cancel))
}
