#![allow(elided_lifetimes_in_paths)]
#![allow(clippy::wildcard_imports)]
pub use sea_orm_migration::prelude::*;
mod m20220101_000001_users;

mod m20260102_103043_brands;
mod m20260102_103351_categories;
mod m20260102_110138_products;
mod m20260102_111015_product_variants;
mod m20260102_111321_carts;
mod m20260102_123058_cart_items;
mod m20260102_125807_reviews;
mod m20260102_125954_wishlists;
mod m20260102_130819_orders;
mod m20260102_132114_order_items;
mod m20260102_132957_add_is_active_is_staff_to_users;
mod m20260102_133327_drop_carts;
mod m20260102_133835_make_reviews_by_product;
mod m20260103_144317_cart_item_unique_constraint;
pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_users::Migration),
            Box::new(m20260102_103043_brands::Migration),
            Box::new(m20260102_103351_categories::Migration),
            Box::new(m20260102_110138_products::Migration),
            Box::new(m20260102_111015_product_variants::Migration),
            Box::new(m20260102_111321_carts::Migration),
            Box::new(m20260102_123058_cart_items::Migration),
            Box::new(m20260102_125807_reviews::Migration),
            Box::new(m20260102_125954_wishlists::Migration),
            Box::new(m20260102_130819_orders::Migration),
            Box::new(m20260102_132114_order_items::Migration),
            Box::new(m20260102_132957_add_is_active_is_staff_to_users::Migration),
            Box::new(m20260102_133327_drop_carts::Migration),
            Box::new(m20260102_133835_make_reviews_by_product::Migration),
            Box::new(m20260103_144317_cart_item_unique_constraint::Migration),
            // inject-above (do not remove this comment)
        ]
    }
}
