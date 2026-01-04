use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.create_index(
            Index::create()
                .table("cart_items")
                .name("cart_items_user_id_product_variant_id_key")
                .col("user_id")
                .col("product_variant_id")
                .unique()
                .to_owned(),
        )
        .await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.drop_index(
            Index::drop()
                .table("cart_items")
                .name("cart_items_user_id_product_variant_id_key")
                .to_owned(),
        )
        .await
    }
}
