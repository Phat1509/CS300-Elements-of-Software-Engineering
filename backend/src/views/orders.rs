use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::models::{order_items, orders, product_variants, products};

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct OrderItem {
    #[serde(flatten)]
    pub order_item: order_items::Model,

    pub product: Option<products::Model>,
    pub product_variant: product_variants::Model,
}

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct Order {
    #[serde(flatten)]
    pub order: orders::Model,

    pub items: Vec<OrderItem>,
}

impl Order {
    #[must_use]
    pub fn create(
        order: orders::Model,
        order_items: Vec<order_items::Model>,
        product_variants: &HashMap<i32, (product_variants::Model, Option<products::Model>)>,
    ) -> Self {
        Self {
            order,
            items: order_items
                .into_iter()
                .filter_map(|order_item| {
                    let (product_variant, product) =
                        product_variants.get(&order_item.product_variant_id)?;

                    Some(OrderItem {
                        order_item,
                        product: product.clone(),
                        product_variant: product_variant.clone(),
                    })
                })
                .collect::<Vec<_>>(),
        }
    }
}
