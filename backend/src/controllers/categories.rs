#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_openapi::prelude::{routes, OpenApiRouter};
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::{
    controllers::{forbidden, ErrorDetail},
    models::{
        _entities::categories::{ActiveModel, Entity, Model},
        users,
    },
};

#[derive(Clone, Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct CategoryCreateParams {
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub parent_id: Option<i32>,
}

impl CategoryCreateParams {
    fn update(&self, item: &mut ActiveModel) {
        item.name = Set(self.name.clone());
        item.slug = Set(self.slug.clone());
        item.description = Set(self.description.clone());
        item.parent_id = Set(self.parent_id);
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct CategoryUpdateParams {
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

    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    pub parent_id: Option<Option<i32>>,
}

impl CategoryUpdateParams {
    fn update(&self, item: &mut ActiveModel) {
        if let Some(ref name) = self.name {
            item.name = Set(name.clone());
        }

        if let Some(ref slug) = self.slug {
            item.slug = Set(slug.clone());
        }

        if let Some(ref description) = self.description {
            item.description = Set(description.clone());
        }

        if let Some(parent_id) = self.parent_id {
            item.parent_id = Set(parent_id);
        }
    }
}

async fn load_item(ctx: &AppContext, id: i32) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;

    item.ok_or_else(|| Error::NotFound)
}

#[utoipa::path(
    get,
    path = "/api/categories",
    tags = ["Categories"],
    summary = "List categories",
    responses(
        (status = OK, description = "List categories", body = Vec<Model>),
    )
)]
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

#[utoipa::path(
    post,
    path = "/api/categories",
    tags = ["Categories"],
    summary = "Create category",
    responses(
        (status = OK, description = "Created category", body = Model),
        (status = UNAUTHORIZED, description = "Not authenticated", body = ErrorDetail),
        (status = FORBIDDEN, description = "Insufficient permission", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn add(
    auth: auth::JWTWithUser<users::Model>,
    State(ctx): State<AppContext>,
    Json(params): Json<CategoryCreateParams>,
) -> Result<Response> {
    if !auth.user.is_staff {
        return forbidden("You are not authorized to perform this action.");
    }

    // Check if the parent category exists
    if let Some(parent_id) = params.parent_id {
        let _ = load_item(&ctx, parent_id).await?;
    }

    let mut item = ActiveModel {
        ..Default::default()
    };

    params.update(&mut item);
    format::json(item.insert(&ctx.db).await?)
}

#[utoipa::path(
    patch,
    path = "/api/categories/{id}",
    tags = ["Categories"],
    summary = "Update category",
    responses(
        (status = OK, description = "Updated category", body = Model),
        (status = UNAUTHORIZED, description = "Not authenticated", body = ErrorDetail),
        (status = FORBIDDEN, description = "Insufficient permission", body = ErrorDetail),
        (status = NOT_FOUND, description = "Category not found", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn update(
    auth: auth::JWTWithUser<users::Model>,
    Path(id): Path<String>,
    State(ctx): State<AppContext>,
    Json(params): Json<CategoryUpdateParams>,
) -> Result<Response> {
    if !auth.user.is_staff {
        return forbidden("You are not authorized to perform this action.");
    }

    // Check if the parent category exists
    if let Some(Some(parent_id)) = params.parent_id {
        let _ = load_item(&ctx, parent_id).await?;
    }

    let item = Model::get_by_id_or_slug(&ctx.db, id)
        .await?
        .ok_or_else(|| Error::NotFound)?;
    let mut item = item.into_active_model();

    params.update(&mut item);
    format::json(item.update(&ctx.db).await?)
}

#[utoipa::path(
    delete,
    path = "/api/categories/{id}",
    tags = ["Categories"],
    summary = "Delete category",
    responses(
        (status = OK, description = "Deleted category"),
        (status = UNAUTHORIZED, description = "Not authenticated", body = ErrorDetail),
        (status = FORBIDDEN, description = "Insufficient permission", body = ErrorDetail),
        (status = NOT_FOUND, description = "Category not found", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn remove(
    auth: auth::JWTWithUser<users::Model>,
    Path(id): Path<String>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    if !auth.user.is_staff {
        return forbidden("You are not authorized to perform this action.");
    }

    Model::get_by_id_or_slug(&ctx.db, id)
        .await?
        .ok_or_else(|| Error::NotFound)?
        .delete(&ctx.db)
        .await?;

    format::empty()
}

#[utoipa::path(
    get,
    path = "/api/categories/{id}",
    tags = ["Categories"],
    summary = "Get category by ID",
    responses(
        (status = OK, description = "Retrieved category", body = Model),
        (status = UNAUTHORIZED, description = "Not authenticated", body = ErrorDetail),
        (status = FORBIDDEN, description = "Insufficient permission", body = ErrorDetail),
        (status = NOT_FOUND, description = "Category not found", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn get_one(Path(id): Path<String>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(
        Model::get_by_id_or_slug(&ctx.db, id)
            .await?
            .ok_or_else(|| Error::NotFound)?,
    )
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/categories/")
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
