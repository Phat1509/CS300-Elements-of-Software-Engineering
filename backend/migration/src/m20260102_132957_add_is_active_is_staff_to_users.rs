use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.alter_table(
            Table::alter()
                .table("users")
                .add_column(
                    ColumnDef::new("is_staff")
                        .boolean()
                        .not_null()
                        .default(false),
                )
                .add_column(
                    ColumnDef::new("is_active")
                        .boolean()
                        .not_null()
                        .default(true),
                )
                .to_owned(),
        )
        .await?;
        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        remove_column(m, "users", "is_staff").await?;
        remove_column(m, "users", "is_active").await?;
        Ok(())
    }
}
