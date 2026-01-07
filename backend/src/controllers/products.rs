// backend/src/controllers/product.rs
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_openapi::prelude::{routes, OpenApiRouter};
use loco_rs::{model::query::PaginationQuery, prelude::*};
use sea_orm::{PaginatorTrait, QueryOrder};
use serde::{Deserialize, Serialize};

use super::forbidden;
use crate::{
    controllers::ErrorDetail,
    models::{
        _entities::{
            product_variants,
            products::{ActiveModel, Column, Entity},
        },
        brands, categories,
        products::Model,
        users,
    },
    views::{pagination::PageResponse, products::Product},
};

#[derive(Clone, Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ProductCreateParams {
    pub brand_id: Option<i32>,
    pub category_id: Option<i32>,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub price: f64,
    pub image_url: Option<String>,
    pub discount_percentage: Option<i32>,
    pub is_active: bool,
}

impl ProductCreateParams {
    fn update(&self, item: &mut ActiveModel) {
        item.brand_id = Set(self.brand_id);
        item.category_id = Set(self.category_id);
        item.name = Set(self.name.clone());
        item.slug = Set(self.slug.clone());
        item.description = Set(self.description.clone());
        item.price = Set(self.price);
        item.image_url = Set(self.image_url.clone());
        item.discount_percentage = Set(self.discount_percentage);
        item.is_active = Set(self.is_active);
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ProductUpdateParams {
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    pub brand_id: Option<Option<i32>>,

    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    pub category_id: Option<Option<i32>>,

    #[serde(default)]
    pub name: Option<String>,

    #[serde(default)]
    pub slug: Option<String>,

    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    pub description: Option<Option<String>>,

    #[serde(default)]
    pub price: Option<f64>,

    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    pub image_url: Option<Option<String>>,

    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    pub discount_percentage: Option<Option<i32>>,

    #[serde(default)]
    pub is_active: Option<bool>,
}

impl ProductUpdateParams {
    fn update(&self, item: &mut ActiveModel) {
        if let Some(id) = self.brand_id {
            item.brand_id = Set(id);
        }
        if let Some(id) = self.category_id {
            item.category_id = Set(id);
        }
        if let Some(ref name) = self.name {
            item.name = Set(name.clone());
        }
        if let Some(ref slug) = self.slug {
            item.slug = Set(slug.clone());
        }
        if let Some(ref description) = self.description {
            item.description = Set(description.clone());
        }
        if let Some(price) = self.price {
            item.price = Set(price);
        }
        if let Some(ref image_url) = self.image_url {
            item.image_url = Set(image_url.clone());
        }
        if let Some(discount_percentage) = self.discount_percentage {
            item.discount_percentage = Set(discount_percentage);
        }
        if let Some(is_active) = self.is_active {
            item.is_active = Set(is_active);
        }
    }
}

async fn load_item(ctx: &AppContext, id: i32) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

#[utoipa::path(
    get,
    path = "/api/products",
    tags = ["Products"],
    summary = "List products",
    responses(
        (status = OK, description = "Products", body = PageResponse<Product>),
    )
)]
#[debug_handler]
pub async fn list(
    State(ctx): State<AppContext>,
    Query(pagination): Query<PaginationQuery>,
) -> Result<Response> {
    let paginator = Entity::find()
        .find_also_related(brands::Entity)
        .find_also_related(categories::Entity)
        .order_by_desc(Column::UpdatedAt)
        .order_by_asc(Column::Id)
        .paginate(&ctx.db, pagination.page_size);
    let counts = paginator.num_items_and_pages().await?;
    let products = paginator
        .fetch_page(pagination.page - 1)
        .await?
        .into_iter()
        .map(|(product, brand, category)| Product {
            product,
            brand,
            category,
            variants: None,
        })
        .collect::<Vec<_>>();

    format::json(PageResponse {
        items: products,
        counts: counts.into(),
    })
}

#[utoipa::path(
    post,
    path = "/api/products",
    tags = ["Products"],
    summary = "Create product",
    responses(
        (status = OK, description = "Product created", body = Model),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = FORBIDDEN, description = "Forbidden", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn add(
    auth: auth::JWTWithUser<users::Model>,
    State(ctx): State<AppContext>,
    Json(params): Json<ProductCreateParams>,
) -> Result<Response> {
    if !auth.user.is_staff {
        return forbidden("You are not authorized to perform this action.");
    }

    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

#[utoipa::path(
    patch,
    path = "/api/products/{id}",
    tags = ["Products"],
    summary = "Update product",
    responses(
        (status = OK, description = "Product updated", body = Model),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = FORBIDDEN, description = "Forbidden", body = ErrorDetail),
        (status = NOT_FOUND, description = "Product not found", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn update(
    auth: auth::JWTWithUser<users::Model>,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    Json(params): Json<ProductUpdateParams>,
) -> Result<Response> {
    if !auth.user.is_staff {
        return forbidden("You are not authorized to perform this action.");
    }

    let item = load_item(&ctx, id).await?;
    let mut item = item.into_active_model();
    params.update(&mut item);
    let item = item.update(&ctx.db).await?;
    format::json(item)
}

#[utoipa::path(
    delete,
    path = "/api/products/{id}",
    tags = ["Products"],
    summary = "Delete product",
    responses(
        (status = OK, description = "Product deleted"),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = FORBIDDEN, description = "Forbidden", body = ErrorDetail),
        (status = NOT_FOUND, description = "Product not found", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn remove(
    auth: auth::JWTWithUser<users::Model>,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    if !auth.user.is_staff {
        return forbidden("You are not authorized to perform this action.");
    }

    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

#[utoipa::path(
    get,
    path = "/api/products/{id}",
    tags = ["Products"],
    summary = "Get product by ID",
    responses(
        (status = OK, description = "Product retrieved", body = Product),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = FORBIDDEN, description = "Forbidden", body = ErrorDetail),
        (status = NOT_FOUND, description = "Product not found", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn get_one(Path(id): Path<i32>, State(ctx): State<AppContext>) -> Result<Response> {
    let (product, brand, category) = Model::find_by_id_with_brand_category(&ctx.db, id)
        .await?
        .ok_or_else(|| Error::NotFound)?;
    let variants = product
        .find_related(product_variants::Entity)
        .all(&ctx.db)
        .await?;

    format::json(Product {
        product,
        brand,
        category,
        variants: Some(variants),
    })
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/products/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", patch(update))
}

pub fn api_routes() -> OpenApiRouter<AppContext> {
    OpenApiRouter::new()
        .routes(routes!(list, add))
        .routes(routes!(get_one, remove, update))
}
