#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_openapi::prelude::{routes, OpenApiRouter};
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::{
    controllers::{forbidden, ErrorDetail},
    models::{
        _entities::reviews::Column,
        products,
        reviews::{ActiveModel, Entity, Model},
        users,
    },
    views::{
        products::Product,
        reviews::{ListReviewsResponse, Review},
        users::User,
    },
};

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ReviewCreateParams {
    pub rating: i32,
    pub content: Option<String>,
}

impl ReviewCreateParams {
    fn update(&self, item: &mut ActiveModel) {
        item.rating = Set(self.rating);
        item.content = Set(self.content.clone());
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ReviewUpdateParams {
    #[serde(default)]
    pub rating: Option<i32>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    pub content: Option<Option<String>>,
}

impl ReviewUpdateParams {
    fn update(&self, item: &mut ActiveModel) {
        if let Some(rating) = self.rating {
            item.rating = Set(rating);
        }
        if let Some(ref content) = self.content {
            item.content = Set(content.clone());
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/products/{product_id}/reviews",
    tags = ["Reviews"],
    summary = "List reviews for product ID",
    responses(
        (status = OK, description = "Reviews listed", body = ListReviewsResponse),
    )
)]
#[debug_handler]
pub async fn list(Path(product_id): Path<i32>, State(ctx): State<AppContext>) -> Result<Response> {
    let (product, brand, category) =
        products::Model::find_by_id_with_brand_category(&ctx.db, product_id)
            .await?
            .ok_or_else(|| Error::NotFound)?;
    let reviews = Entity::find()
        .filter(Column::ProductId.eq(product_id))
        .find_also_related(users::Entity)
        .all(&ctx.db)
        .await?
        .into_iter()
        .map(|(review, user)| Review {
            review,
            user: user.map(|u| User {
                id: u.id,
                name: u.name,
            }),
            product: None,
        })
        .collect::<Vec<_>>();

    format::json(ListReviewsResponse {
        product: Product {
            product,
            brand,
            category,
            variants: None,
        },
        reviews,
    })
}

#[utoipa::path(
    post,
    path = "/api/products/{product_id}/reviews",
    tags = ["Reviews"],
    summary = "Create review for product",
    responses(
        (status = OK, description = "Review created", body = Review),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = NOT_FOUND, description = "Product not found", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn add(
    auth: auth::JWTWithUser<users::Model>,
    Path(product_id): Path<i32>,
    State(ctx): State<AppContext>,
    Json(params): Json<ReviewCreateParams>,
) -> Result<Response> {
    let (product, brand, category) =
        products::Model::find_by_id_with_brand_category(&ctx.db, product_id)
            .await?
            .ok_or_else(|| Error::NotFound)?;
    let user = users::Entity::find_by_id(auth.user.id).one(&ctx.db).await?;
    let mut item = ActiveModel {
        user_id: Set(auth.user.id),
        ..Default::default()
    };

    params.update(&mut item);

    let item = item.insert(&ctx.db).await?;

    format::json(Review {
        review: item,
        user: user.map(|u| User {
            id: u.id,
            name: u.name,
        }),
        product: Some(Product {
            product,
            brand,
            category,
            variants: None,
        }),
    })
}

#[utoipa::path(
    get,
    path = "/api/products/{product_id}/reviews/{user_id}",
    tags = ["Reviews"],
    summary = "Get review",
    responses(
        (status = OK, description = "Review retrieved", body = Model),
        (status = NOT_FOUND, description = "Product or review not found", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn get_one(
    Path((product_id, user_id)): Path<(i32, i32)>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let (product, brand, category) =
        products::Model::find_by_id_with_brand_category(&ctx.db, product_id)
            .await?
            .ok_or_else(|| Error::NotFound)?;
    let (review, user) = Model::find_by_product_and_user(&ctx.db, product_id, user_id)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    format::json(Review {
        review,
        user: user.map(|u| User {
            id: u.id,
            name: u.name,
        }),
        product: Some(Product {
            product,
            brand,
            category,
            variants: None,
        }),
    })
}

#[utoipa::path(
    patch,
    path = "/api/products/{product_id}/reviews/{user_id}",
    tags = ["Reviews"],
    summary = "Update review",
    responses(
        (status = OK, description = "Review updated", body = Review),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = FORBIDDEN, description = "Forbidden", body = ErrorDetail),
        (status = NOT_FOUND, description = "Product or review not found", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn update(
    auth: auth::JWTWithUser<users::Model>,
    Path((product_id, user_id)): Path<(i32, i32)>,
    State(ctx): State<AppContext>,
    Json(params): Json<ReviewUpdateParams>,
) -> Result<Response> {
    if auth.user.id != user_id && !auth.user.is_staff {
        return forbidden("You are not authorized to perform this action.");
    }

    let (product, brand, category) =
        products::Model::find_by_id_with_brand_category(&ctx.db, product_id)
            .await?
            .ok_or_else(|| Error::NotFound)?;
    let (review, user) = Model::find_by_product_and_user(&ctx.db, product_id, user_id)
        .await?
        .ok_or_else(|| Error::NotFound)?;
    let mut review = review.into_active_model();

    params.update(&mut review);

    let review = review.update(&ctx.db).await?;

    format::json(Review {
        review,
        user: user.map(|u| User {
            id: u.id,
            name: u.name,
        }),
        product: Some(Product {
            product,
            brand,
            category,
            variants: None,
        }),
    })
}

#[utoipa::path(
    delete,
    path = "/api/products/{product_id}/reviews/{user_id}",
    tags = ["Reviews"],
    summary = "Delete review",
    responses(
        (status = OK, description = "Review deleted"),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = FORBIDDEN, description = "Forbidden", body = ErrorDetail),
        (status = NOT_FOUND, description = "Product or review not found", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn remove(
    auth: auth::JWTWithUser<users::Model>,
    Path((product_id, user_id)): Path<(i32, i32)>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    if auth.user.id != user_id && !auth.user.is_staff {
        return forbidden("You are not authorized to perform this action.");
    }

    let _ = Model::delete_by_product_and_user(&ctx.db, product_id, user_id).await?;

    format::empty()
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/products/{product_id}/reviews/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{user_id}", get(get_one))
        .add("{user_id}", patch(update))
        .add("{user_id}", delete(remove))
}

pub fn api_routes() -> OpenApiRouter<AppContext> {
    OpenApiRouter::new()
        .routes(routes!(list, add))
        .routes(routes!(get_one, update, remove))
}
