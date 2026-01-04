use serde::{Deserialize, Serialize};

use crate::models::{cart_items, product_variants, products};

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct CartItem {
    #[serde(flatten)]
    pub cart_item: cart_items::Model,

    pub product: Option<products::Model>,
    pub product_variant: Option<product_variants::Model>,
}
