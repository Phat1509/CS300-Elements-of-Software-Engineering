use serde::{Deserialize, Serialize};

use crate::{
    models::reviews,
    views::{products::Product, users::User},
};

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct Review {
    #[serde(flatten)]
    pub review: reviews::Model,
    pub user: Option<User>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub product: Option<Product>,
}

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ListReviewsResponse {
    pub product: Product,
    pub reviews: Vec<Review>,
}
