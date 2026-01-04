use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "reviews").await?;
        m.create_table(
            Table::create()
                .table("reviews")
                .col(
                    ColumnDef::new("id")
                        .integer()
                        .primary_key()
                        .auto_increment(),
                )
                .col(ColumnDef::new("user_id").integer().not_null())
                .col(ColumnDef::new("product_id").integer().not_null())
                .col(
                    ColumnDef::new("rating")
                        .unsigned()
                        .not_null()
                        .check(Expr::col("rating").gte(1).and(Expr::col("rating").lte(5))),
                )
                .col(ColumnDef::new("content").text().null())
                .col(
                    ColumnDef::new("created_at")
                        .timestamp_with_time_zone()
                        .not_null()
                        .default(Expr::current_timestamp()),
                )
                .col(
                    ColumnDef::new("updated_at")
                        .timestamp_with_time_zone()
                        .not_null()
                        .default(Expr::current_timestamp()),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("fk-users-user_id-to-reviews")
                        .from("reviews", "user_id")
                        .to("users", "id")
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("fk-products-product_id-to-reviews")
                        .from("reviews", "product_id")
                        .to("products", "id")
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .to_owned(),
        )
        .await?;
        m.create_index(
            Index::create()
                .name("reviews_user_id_product_id_key")
                .table("reviews")
                .col("user_id")
                .col("product_id")
                .to_owned(),
        )
        .await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "reviews").await?;
        create_table(
            m,
            "reviews",
            &[
                ("id", ColType::PkAuto),
                ("rating", ColType::Unsigned),
                ("content", ColType::TextNull),
            ],
            &[("user", ""), ("product_variant", "")],
        )
        .await
    }
}
