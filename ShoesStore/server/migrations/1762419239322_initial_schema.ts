import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Create ENUM types
  await db.schema
    .createType("payment_method")
    .asEnum(["PAYSTACK", "STRIPE", "COD"])
    .execute();

  await db.schema
    .createType("order_status")
    .asEnum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"])
    .execute();

  // Create users table
  await db.schema
    .createTable("users")
    .addColumn("user_id", "serial", (col) => col.primaryKey())
    .addColumn("username", "varchar(50)", (col) => col.unique().notNull())
    .addColumn("email", "varchar(100)", (col) => col.unique().notNull())
    .addColumn("password", "varchar(200)")
    .addColumn("fullname", "varchar(100)")
    .addColumn("phone", "varchar(20)")
    .addColumn("gender", "varchar(10)", (col) =>
      col.check(sql`gender IN ('Male', 'Female', 'Other')`),
    )
    .addColumn("roles", sql`varchar(10)[]`, (col) =>
      col.defaultTo(sql`'{customer}'::varchar[]`).notNull(),
    )
    .addColumn("google_id", "varchar(100)", (col) => col.unique())
    .addColumn("address", "varchar(200)")
    .addColumn("city", "varchar(100)")
    .addColumn("state", "varchar(100)")
    .addColumn("country", "varchar(100)")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();

  // Create brands table
  await db.schema
    .createTable("brands")
    .addColumn("brand_id", "serial", (col) => col.primaryKey())
    .addColumn("name", "varchar(100)", (col) => col.unique().notNull())
    .addColumn("description", "text")
    .execute();

  // Create categories table
  await db.schema
    .createTable("categories")
    .addColumn("category_id", "serial", (col) => col.primaryKey())
    .addColumn("name", "varchar(100)", (col) => col.notNull())
    .addColumn("slug", "varchar(100)", (col) => col.unique().notNull())
    .addColumn("description", "text")
    .addColumn("parent_id", "integer", (col) =>
      col.references("categories.category_id").onDelete("cascade"),
    )
    .addUniqueConstraint("categories_name_parent_id_unique", [
      "name",
      "parent_id",
    ])
    .execute();

  // Create products table
  await db.schema
    .createTable("products")
    .addColumn("product_id", "serial", (col) => col.primaryKey())
    .addColumn("brand_id", "integer", (col) =>
      col.references("brands.brand_id").onDelete("set null"),
    )
    .addColumn("category_id", "integer", (col) =>
      col.references("categories.category_id").onDelete("set null"),
    )
    .addColumn("name", "varchar(150)", (col) => col.notNull())
    .addColumn("slug", "varchar(150)", (col) => col.unique().notNull())
    .addColumn("description", "text")
    .addColumn("price", "real", (col) => col.notNull())
    .addColumn("image_url", "varchar")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addColumn("discount_percentage", "integer", (col) =>
      col.check(sql`discount_percentage BETWEEN 0 AND 100`),
    )
    .addColumn("is_active", "boolean", (col) => col.defaultTo(true))
    .execute();

  // Create product_variants table
  await db.schema
    .createTable("product_variants")
    .addColumn("variant_id", "serial", (col) => col.primaryKey())
    .addColumn("product_id", "integer", (col) =>
      col.references("products.product_id").onDelete("cascade").notNull(),
    )
    .addColumn("color", "varchar(50)")
    .addColumn("size", "varchar(10)")
    .addColumn("stock", "integer", (col) =>
      col.notNull().check(sql`stock >= 0`),
    )
    .addColumn("sku", "varchar(50)", (col) => col.unique())
    .execute();

  // Create cart table
  await db.schema
    .createTable("cart")
    .addColumn("cart_id", "serial", (col) => col.primaryKey())
    .addColumn("user_id", "integer", (col) =>
      col.references("users.user_id").onDelete("cascade"),
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();

  // Create cart_item table
  await db.schema
    .createTable("cart_item")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("cart_id", "integer", (col) =>
      col.references("cart.cart_id").onDelete("cascade").notNull(),
    )
    .addColumn("variant_id", "integer", (col) =>
      col.references("product_variants.variant_id").onDelete("set null"),
    )
    .addColumn("quantity", "integer", (col) =>
      col.notNull().check(sql`quantity > 0`),
    )
    .addUniqueConstraint("cart_item_cart_id_variant_id_unique", [
      "cart_id",
      "variant_id",
    ])
    .execute();

  // Create orders table
  await db.schema
    .createTable("orders")
    .addColumn("order_id", "serial", (col) => col.primaryKey())
    .addColumn("user_id", "integer", (col) =>
      col.references("users.user_id").onDelete("cascade"),
    )
    .addColumn("status", sql`order_status`, (col) =>
      col.defaultTo(sql`'PENDING'`).notNull(),
    )
    .addColumn("total_amount", "real", (col) => col.notNull())
    .addColumn("payment", sql`payment_method`)
    .addColumn("shipping_address", "varchar(200)")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();

  // Create order_item table
  await db.schema
    .createTable("order_item")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("order_id", "integer", (col) =>
      col.references("orders.order_id").onDelete("cascade"),
    )
    .addColumn("variant_id", "integer", (col) =>
      col.references("product_variants.variant_id").onDelete("set null"),
    )
    .addColumn("quantity", "integer", (col) =>
      col.notNull().check(sql`quantity > 0`),
    )
    .addColumn("price", "real", (col) => col.notNull())
    .execute();

  // Create reviews table
  await db.schema
    .createTable("reviews")
    .addColumn("review_id", "serial", (col) => col.primaryKey())
    .addColumn("user_id", "integer", (col) =>
      col.references("users.user_id").onDelete("cascade"),
    )
    .addColumn("product_id", "integer", (col) =>
      col.references("products.product_id").onDelete("cascade"),
    )
    .addColumn("rating", "integer", (col) =>
      col.check(sql`rating BETWEEN 1 AND 5`),
    )
    .addColumn("content", "text")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addUniqueConstraint("reviews_user_id_product_id_unique", [
      "user_id",
      "product_id",
    ])
    .execute();

  // Create wishlists table
  await db.schema
    .createTable("wishlists")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("user_id", "integer", (col) =>
      col.references("users.user_id").onDelete("cascade"),
    )
    .addColumn("product_id", "integer", (col) =>
      col.references("products.product_id").onDelete("cascade"),
    )
    .addUniqueConstraint("wishlists_user_id_product_id_unique", [
      "user_id",
      "product_id",
    ])
    .execute();

  // Create resetTokens table
  await db.schema
    .createTable("resetTokens")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("email", "varchar(100)", (col) => col.notNull())
    .addColumn("token", "varchar(255)", (col) => col.notNull())
    .addColumn("used", "boolean", (col) => col.defaultTo(false).notNull())
    .addColumn("expiration", "timestamp")
    .execute();

  // Create indexes
  await db.schema
    .createIndex("users_lower_email_idx")
    .unique()
    .on("users")
    .expression(sql`LOWER(email)`)
    .execute();

  await db.schema
    .createIndex("users_lower_username_idx")
    .unique()
    .on("users")
    .expression(sql`LOWER(username)`)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await db.schema.dropIndex("users_lower_username_idx").execute();
  await db.schema.dropIndex("users_lower_email_idx").execute();

  // Drop tables in reverse order (respecting foreign key dependencies)
  await db.schema.dropTable("resetTokens").execute();
  await db.schema.dropTable("wishlists").execute();
  await db.schema.dropTable("reviews").execute();
  await db.schema.dropTable("order_item").execute();
  await db.schema.dropTable("orders").execute();
  await db.schema.dropTable("cart_item").execute();
  await db.schema.dropTable("cart").execute();
  await db.schema.dropTable("product_variants").execute();
  await db.schema.dropTable("products").execute();
  await db.schema.dropTable("categories").execute();
  await db.schema.dropTable("brands").execute();
  await db.schema.dropTable("users").execute();

  // Drop ENUM types
  await db.schema.dropType("order_status").execute();
  await db.schema.dropType("payment_method").execute();
}
