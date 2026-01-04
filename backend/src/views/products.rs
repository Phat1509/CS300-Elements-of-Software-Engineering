use serde::{Deserialize, Serialize};

use crate::models::{brands, categories, product_variants, products};

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct Product {
    #[serde(flatten)]
    pub product: products::Model,

    pub brand: Option<brands::Model>,
    pub category: Option<categories::Model>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub variants: Option<Vec<product_variants::Model>>,
}
