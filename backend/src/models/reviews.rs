use crate::models::{_entities::reviews::Column, users};

pub use super::_entities::reviews::{ActiveModel, Entity, Model};
use loco_rs::{model::ModelResult, prelude::Validatable};
use sea_orm::{entity::prelude::*, DeleteResult};
use serde::Deserialize;
use validator::Validate;
pub type Reviews = Entity;

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
    #[validate(range(min = 1, max = 5, message = "Rating must be between 1 and 5"))]
    pub rating: i32,
}

impl Validatable for ActiveModel {
    fn validator(&self) -> Box<dyn validator::Validate> {
        Box::new(Validator {
            rating: *self.rating.as_ref(),
        })
    }
}

// implement your read-oriented logic here
impl Model {
    /// # Errors
    /// Returns an error if the underlying database operation fails.
    pub async fn find_by_product_and_user(
        db: &DatabaseConnection,
        product_id: i32,
        user_id: i32,
    ) -> ModelResult<Option<(Self, Option<users::Model>)>> {
        Ok(Entity::find()
            .filter(
                Column::ProductId
                    .eq(product_id)
                    .and(Column::UserId.eq(user_id)),
            )
            .find_also_related(users::Entity)
            .one(db)
            .await?)
    }

    /// # Errors
    /// Returns an error if the underlying database operation fails.
    pub async fn delete_by_product_and_user(
        db: &DatabaseConnection,
        product_id: i32,
        user_id: i32,
    ) -> ModelResult<DeleteResult> {
        Ok(Entity::delete_many()
            .filter(
                Column::ProductId
                    .eq(product_id)
                    .and(Column::UserId.eq(user_id)),
            )
            .exec(db)
            .await?)
    }
}

// implement your write-oriented logic here
impl ActiveModel {}

// implement your custom finders, selectors oriented logic here
impl Entity {}
