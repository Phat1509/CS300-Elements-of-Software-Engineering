use std::collections::HashMap;

use crate::models::_entities::{product_variants::Column, products};

pub use super::_entities::product_variants::{ActiveModel, Entity, Model};
use loco_rs::{model::ModelResult, prelude::Validatable};
use sea_orm::entity::prelude::*;
use serde::Deserialize;
use validator::Validate;
pub type ProductVariants = Entity;

#[derive(Debug, Validate, Deserialize)]
pub struct Validator {
    #[validate(range(min = 0, message = "Product stock must be a non-negative value."))]
    pub stock: i32,
}

impl Validatable for ActiveModel {
    fn validator(&self) -> Box<dyn validator::Validate> {
        Box::new(Validator {
            stock: *self.stock.as_ref(),
        })
    }
}

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    async fn before_save<C>(self, _db: &C, insert: bool) -> std::result::Result<Self, DbErr>
    where
        C: ConnectionTrait,
    {
        self.validate()?;
        if !insert && self.updated_at.is_unchanged() {
            let mut this = self;
            this.updated_at = sea_orm::ActiveValue::Set(chrono::Utc::now().into());
            Ok(this)
        } else {
            Ok(self)
        }
    }
}

// implement your read-oriented logic here
impl Model {
    /// # Errors
    /// Returns an error if the underlying database operation fails.
    pub async fn find_many_with_product<C: ConnectionTrait>(
        db: &C,
        ids: impl IntoIterator<Item = i32>,
    ) -> ModelResult<HashMap<i32, (Self, Option<products::Model>)>> {
        Ok(Entity::find()
            .filter(Column::Id.is_in(ids))
            .find_also_related(products::Entity)
            .all(db)
            .await?
            .into_iter()
            .map(|v| (v.0.id, v))
            .collect::<HashMap<_, _>>())
    }
}

// implement your write-oriented logic here
impl ActiveModel {}

// implement your custom finders, selectors oriented logic here
impl Entity {}
