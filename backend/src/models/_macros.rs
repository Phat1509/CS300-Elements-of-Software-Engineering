macro_rules! impl_find_by_slug {
    () => {
        impl Model {
            pub async fn get_by_slug<C: sea_orm::entity::prelude::ConnectionTrait>(
                db: &C,
                slug: String,
            ) -> loco_rs::model::ModelResult<Option<Self>> {
                Ok(Entity::find().filter(Column::Slug.eq(slug)).one(db).await?)
            }

            pub async fn get_by_id_or_slug<C: sea_orm::entity::prelude::ConnectionTrait>(
                db: &C,
                id_or_slug: String,
            ) -> loco_rs::model::ModelResult<Option<Self>> {
                if let Ok(id) = id_or_slug.parse::<i32>() {
                    // If it's a numeric string, IDs take precedence, but fall
                    // back to a slug if there's no item with the given ID.
                    return match Entity::find_by_id(id).one(db).await? {
                        Some(model) => Ok(Some(model)),
                        None => Self::get_by_slug(db, id_or_slug).await,
                    };
                }

                Self::get_by_slug(db, id_or_slug).await
            }
        }
    };
}

pub(super) use impl_find_by_slug;
