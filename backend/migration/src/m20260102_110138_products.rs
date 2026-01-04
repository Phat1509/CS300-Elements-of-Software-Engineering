use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.create_table(
            Table::create()
                .table("products")
                .col(
                    ColumnDef::new("id")
                        .integer()
                        .auto_increment()
                        .primary_key(),
                )
                .col(ColumnDef::new("brand_id").integer().null())
                .col(ColumnDef::new("category_id").integer().null())
                .col(ColumnDef::new("name").string().not_null())
                .col(ColumnDef::new("slug").string().not_null())
                .col(ColumnDef::new("description").text().null())
                .col(ColumnDef::new("price").double().not_null())
                .col(ColumnDef::new("image_url").string().null())
                .col(ColumnDef::new("discount_percentage").integer().null())
                .col(
                    ColumnDef::new("is_active")
                        .boolean()
                        .not_null()
                        .default(true),
                )
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
                        .name("fk-brands-brand_id-to-products")
                        .from("products", "brand_id")
                        .to("brands", "id")
                        .on_delete(ForeignKeyAction::SetNull)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("fk-categories-category_id-to-products")
                        .from("products", "category_id")
                        .to("categories", "id")
                        .on_delete(ForeignKeyAction::SetNull)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .to_owned(),
        )
        .await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "products").await
    }
}
