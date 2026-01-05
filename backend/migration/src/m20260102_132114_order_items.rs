use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        create_table(
            m,
            "order_items",
            &[
                ("id", ColType::PkAuto),
                ("quantity", ColType::UnsignedNull),
                ("price", ColType::Decimal),
            ],
            &[("order", ""), ("product_variant", "")],
        )
        .await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "order_items").await
    }
}
