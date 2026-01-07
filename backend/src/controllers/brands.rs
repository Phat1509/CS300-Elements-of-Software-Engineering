#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_openapi::prelude::{routes, OpenApiRouter};
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::{
    controllers::{forbidden, ErrorDetail},
    models::{
        _entities::brands::{ActiveModel, Entity, Model},
        users,
    },
};

#[derive(Clone, Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct CreateParams {
    pub name: String,
    pub description: Option<String>,
}

impl CreateParams {
    fn update(&self, item: &mut ActiveModel) {
        item.name = Set(self.name.clone());
        item.description = Set(self.description.clone());
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct UpdateParams {
    #[serde(default)]
    pub name: Option<String>,

    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    pub description: Option<Option<String>>,
}

impl UpdateParams {
    fn update(&self, item: &mut ActiveModel) {
        if let Some(ref name) = self.name {
            item.name = Set(name.clone());
        }

        if let Some(ref description) = self.description {
            item.description = Set(description.clone());
        }
    }
}

async fn load_item(ctx: &AppContext, id: i32) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

#[utoipa::path(
    get,
    path = "/api/brands",
    tags = ["Brands"],
    summary = "List brands",
    responses(
        (status = OK, description = "Listed brands", body = Vec<Model>)
    )
)]
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

#[utoipa::path(
    post,
    path = "/api/brands",
    tags = ["Brands"],
    summary = "Create a brand",
    responses(
        (status = OK, description = "Created a brand", body = Model),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = FORBIDDEN, description = "Insufficient permissions", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn add(
    auth: auth::JWTWithUser<users::Model>,
    State(ctx): State<AppContext>,
    Json(params): Json<CreateParams>,
) -> Result<Response> {
    if !auth.user.is_staff {
        return forbidden("You are not authorized to perform this action.");
    }

    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    format::json(item.insert(&ctx.db).await?)
}

#[utoipa::path(
    patch,
    path = "/api/brands/{id}",
    tags = ["Brands"],
    summary = "Edit a brand",
    responses(
        (status = OK, description = "Edited a brand", body = Model),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = FORBIDDEN, description = "Insufficient permissions", body = ErrorDetail),
        (status = NOT_FOUND, description = "Brand not found", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn update(
    auth: auth::JWTWithUser<users::Model>,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    Json(params): Json<UpdateParams>,
) -> Result<Response> {
    if !auth.user.is_staff {
        return forbidden("You are not authorized to perform this action.");
    }

    let item = load_item(&ctx, id).await?;
    let mut item = item.into_active_model();

    params.update(&mut item);
    format::json(item.update(&ctx.db).await?)
}

#[utoipa::path(
    delete,
    path = "/api/brands/{id}",
    tags = ["Brands"],
    summary = "Delete a brand",
    responses(
        (status = OK, description = "Deleted a brand"),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ErrorDetail),
        (status = FORBIDDEN, description = "Insufficient permissions", body = ErrorDetail),
        (status = NOT_FOUND, description = "Brand not found", body = ErrorDetail),
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
    path = "/api/brands/{id}",
    tags = ["Brands"],
    summary = "Get brand by ID",
    responses(
        (status = OK, description = "Got brand", body = Model),
        (status = NOT_FOUND, description = "Brand not found", body = ErrorDetail),
    )
)]
#[debug_handler]
pub async fn get_one(Path(id): Path<i32>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/brands/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", patch(update))
}

pub fn api_routes() -> OpenApiRouter<AppContext> {
    OpenApiRouter::new()
        .routes(routes!(list))
        .routes(routes!(add))
        .routes(routes!(get_one))
        .routes(routes!(remove))
        .routes(routes!(update))
}
