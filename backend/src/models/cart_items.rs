pub use super::_entities::cart_items::{ActiveModel, Entity, Model};
use loco_rs::prelude::Validatable;
use sea_orm::entity::prelude::*;
use serde::Deserialize;
use validator::Validate;
pub type CartItems = Entity;

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    async fn before_save<C>(self, _db: &C, insert: bool) -> std::result::Result<Self, DbErr>
    where
        C: ConnectionTrait,
    {
        if !insert && self.updated_at.is_unchanged() {
            let mut this = self;
            this.updated_at = sea_orm::ActiveValue::Set(chrono::Utc::now().into());
            Ok(this)
        } else {
            Ok(self)
        }
    }
}

#[derive(Debug, Validate, Deserialize)]
pub struct Validator {
    #[validate(range(min = 1, message = "Cart quantity must be a positive value"))]
    pub quantity: i32,
}

impl Validatable for ActiveModel {
    fn validator(&self) -> Box<dyn validator::Validate> {
        Box::new(Validator {
            quantity: self.quantity.try_as_ref().map_or(0, |q| q.unwrap_or(0)),
        })
    }
}

// implement your read-oriented logic here
impl Model {}

// implement your write-oriented logic here
impl ActiveModel {}

// implement your custom finders, selectors oriented logic here
impl Entity {}
