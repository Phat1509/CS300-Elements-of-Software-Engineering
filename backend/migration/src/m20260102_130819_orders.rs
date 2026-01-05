use loco_rs::schema::*;
use sea_orm_migration::prelude::{extension::postgres::Type, *};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.create_type(
            Type::create()
                .as_enum("order_status")
                .values(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"])
                .to_owned(),
        )
        .await?;
        m.create_type(
            Type::create()
                .as_enum("payment_method")
                .values(["PAYSTACK", "STRIPE", "COD"])
                .to_owned(),
        )
        .await?;
        m.create_table(
            Table::create()
                .table("orders")
                .col(
                    ColumnDef::new("id")
                        .integer()
                        .primary_key()
                        .auto_increment(),
                )
                .col(ColumnDef::new("user_id").integer().not_null())
                .col(
                    ColumnDef::new("status")
                        .enumeration(
                            "order_status",
                            ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"],
                        )
                        .not_null()
                        .default("PENDING"),
                )
                .col(ColumnDef::new("amount").decimal().not_null())
                .col(
                    ColumnDef::new("payment_method")
                        .enumeration("payment_method", ["PAYSTACK", "STRIPE", "COD"])
                        .not_null(),
                )
                .col(ColumnDef::new("shipping_address").text().null())
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
                        .name("fk-users-user_id-to-orders")
                        .from("orders", "user_id")
                        .to("users", "id")
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .to_owned(),
        )
        .await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "orders").await?;
        drop_enum_type(m, "payment_method").await?;
        drop_enum_type(m, "order_status").await
    }
}
