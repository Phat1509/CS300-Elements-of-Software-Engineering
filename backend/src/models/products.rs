use crate::models::{brands, categories};

pub use super::_entities::products::{ActiveModel, Entity, Model};
use loco_rs::model::ModelResult;
use sea_orm::entity::prelude::*;

pub type Products = Entity;

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

// implement your read-oriented logic here
impl Model {
    /// # Errors
    /// Returns an error if the underlying database operation fails.
    pub async fn find_by_id_with_brand_category(
        db: &DatabaseConnection,
        id: i32,
    ) -> ModelResult<Option<(Self, Option<brands::Model>, Option<categories::Model>)>> {
        Ok(Entity::find_by_id(id)
            .find_also_related(brands::Entity)
            .find_also_related(categories::Entity)
            .one(db)
            .await?)
    }
}

// implement your write-oriented logic here
impl ActiveModel {}

// implement your custom finders, selectors oriented logic here
impl Entity {}
