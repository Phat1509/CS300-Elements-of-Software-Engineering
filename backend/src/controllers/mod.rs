use axum::http::StatusCode;
use serde::Serialize;

pub mod auth;
pub mod brands;
pub mod cart_items;
pub mod categories;
pub mod orders;
pub mod product_variants;
pub mod products;
pub mod reviews;
pub mod wishlists;

#[derive(Debug, Serialize, utoipa::ToSchema)]
/// Structure representing details about an error.
pub struct ErrorDetail {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub errors: Option<serde_json::Value>,
}

/// # Errors
/// Always return an error.
pub fn forbidden<T: Into<String>, U>(msg: T) -> loco_rs::Result<U> {
    Err(loco_rs::errors::Error::CustomError(
        StatusCode::FORBIDDEN,
        loco_rs::controller::ErrorDetail {
            error: Some("Forbidden".to_string()),
            description: Some(msg.into()),
            errors: None,
        },
    ))
}
