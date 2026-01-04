use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ItemsAndPagesNumber {
    pub total_items: u64,
    pub total_pages: u64,
}

impl From<sea_orm::ItemsAndPagesNumber> for ItemsAndPagesNumber {
    fn from(value: sea_orm::ItemsAndPagesNumber) -> Self {
        Self {
            total_items: value.number_of_items,
            total_pages: value.number_of_pages,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct PageResponse<T> {
    #[serde(flatten)]
    pub counts: ItemsAndPagesNumber,

    pub items: Vec<T>,
}
