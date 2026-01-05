use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "cart_items").await?;
        drop_table(m, "carts").await?;
        create_table(
            m,
            "cart_items",
            &[("id", ColType::PkAuto), ("quantity", ColType::UnsignedNull)],
            &[("user", ""), ("product_variant", "")],
        )
        .await?;
        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "cart_items").await?;
        create_table(m, "carts", &[("id", ColType::PkAuto)], &[("user", "")]).await?;
        create_table(
            m,
            "cart_items",
            &[("id", ColType::PkAuto), ("quantity", ColType::UnsignedNull)],
            &[("cart", ""), ("product_variant", "")],
        )
        .await?;
        Ok(())
    }
}
