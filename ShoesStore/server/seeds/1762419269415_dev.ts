import { Kysely, sql } from "kysely";
import { DB } from "@/db/types";

export async function seed(db: Kysely<DB>): Promise<void> {
    // Insert users
    await db
        .insertInto("users")
        .values([
            {
                username: "john_doe",
                email: "john@example.com",
                password: await Bun.password.hash("password1"),
                fullname: "John Doe",
                phone: "0123456789",
                gender: "Male",
                roles: sql`'{customer}'`,
                address: "123 Main St",
                city: "Hanoi",
                country: "Vietnam",
            },
            {
                username: "jane_smith",
                email: "jane@example.com",
                password: await Bun.password.hash("password2"),
                fullname: "Jane Smith",
                phone: "0987654321",
                gender: "Female",
                roles: sql`'{customer}'`,
                address: "456 Le Loi",
                city: "Ho Chi Minh City",
                country: "Vietnam",
            },
            {
                username: "admin",
                email: "admin@example.com",
                password: await Bun.password.hash("adminpass"),
                fullname: "Admin User",
                phone: "0909090909",
                gender: "Other",
                roles: sql`'{admin}'`,
                address: "789 Tran Phu",
                city: "Da Nang",
                country: "Vietnam",
            },
        ])
        .execute();

    // Insert brands
    await db
        .insertInto("brands")
        .values([
            {
                name: "Nike",
                description: "Global sportswear and footwear brand",
            },
            {
                name: "Adidas",
                description: "German sportswear manufacturer",
            },
            {
                name: "Converse",
                description: "Classic sneaker and lifestyle shoe company",
            },
        ])
        .execute();

    // Insert top-level categories
    await db
        .insertInto("categories")
        .values([
            { name: "Men", slug: "men" },
            { name: "Women", slug: "women" },
            { name: "Kids", slug: "kids" },
        ])
        .execute();

    // Get parent category IDs
    const menCategory = await db
        .selectFrom("categories")
        .select("category_id")
        .where("name", "=", "Men")
        .executeTakeFirstOrThrow();

    const womenCategory = await db
        .selectFrom("categories")
        .select("category_id")
        .where("name", "=", "Women")
        .executeTakeFirstOrThrow();

    const kidsCategory = await db
        .selectFrom("categories")
        .select("category_id")
        .where("name", "=", "Kids")
        .executeTakeFirstOrThrow();

    // Insert subcategories
    await db
        .insertInto("categories")
        .values([
            // Men subcategories
            {
                name: "Running",
                slug: "running-men",
                parent_id: menCategory.category_id,
            },
            {
                name: "Sneakers",
                slug: "sneakers-men",
                parent_id: menCategory.category_id,
            },
            {
                name: "Casual",
                slug: "casual-men",
                parent_id: menCategory.category_id,
            },
            // Women subcategories
            {
                name: "Running",
                slug: "running-women",
                parent_id: womenCategory.category_id,
            },
            {
                name: "Heels",
                slug: "heels-women",
                parent_id: womenCategory.category_id,
            },
            {
                name: "Sneakers",
                slug: "sneakers-women",
                parent_id: womenCategory.category_id,
            },
            // Kids subcategories
            {
                name: "Running",
                slug: "running-kids",
                parent_id: kidsCategory.category_id,
            },
            {
                name: "Sneakers",
                slug: "sneakers-kids",
                parent_id: kidsCategory.category_id,
            },
        ])
        .execute();

    // Get brand IDs
    const nikeBrand = await db
        .selectFrom("brands")
        .select("brand_id")
        .where("name", "=", "Nike")
        .executeTakeFirstOrThrow();

    const adidasBrand = await db
        .selectFrom("brands")
        .select("brand_id")
        .where("name", "=", "Adidas")
        .executeTakeFirstOrThrow();

    const converseBrand = await db
        .selectFrom("brands")
        .select("brand_id")
        .where("name", "=", "Converse")
        .executeTakeFirstOrThrow();

    // Get category IDs
    const runningMenCat = await db
        .selectFrom("categories")
        .select("category_id")
        .where("slug", "=", "running-men")
        .executeTakeFirstOrThrow();

    const sneakersMenCat = await db
        .selectFrom("categories")
        .select("category_id")
        .where("slug", "=", "sneakers-men")
        .executeTakeFirstOrThrow();

    const runningWomenCat = await db
        .selectFrom("categories")
        .select("category_id")
        .where("slug", "=", "running-women")
        .executeTakeFirstOrThrow();

    const sneakersWomenCat = await db
        .selectFrom("categories")
        .select("category_id")
        .where("slug", "=", "sneakers-women")
        .executeTakeFirstOrThrow();

    const sneakersKidsCat = await db
        .selectFrom("categories")
        .select("category_id")
        .where("slug", "=", "sneakers-kids")
        .executeTakeFirstOrThrow();

    // Insert products
    await db
        .insertInto("products")
        .values([
            {
                brand_id: nikeBrand.brand_id,
                category_id: runningMenCat.category_id,
                name: "Nike Air Zoom Pegasus 40",
                slug: "nike-air-zoom-pegasus-40",
                description: "Lightweight running shoes for men",
                price: 120.0,
                image_url: "https://example.com/nike_pegasus.jpg",
            },
            {
                brand_id: adidasBrand.brand_id,
                category_id: sneakersMenCat.category_id,
                name: "Adidas Ultraboost 23",
                slug: "adidas-ultraboost-23",
                description: "High-performance men sneakers",
                price: 150.0,
                image_url: "https://example.com/adidas_ultraboost.jpg",
            },
            {
                brand_id: nikeBrand.brand_id,
                category_id: runningWomenCat.category_id,
                name: "Nike Air Zoom Winflo 10",
                slug: "nike-air-zoom-winflo-10",
                description: "Running shoes for women",
                price: 110.0,
                image_url: "https://example.com/nike_winflo.jpg",
            },
            {
                brand_id: converseBrand.brand_id,
                category_id: sneakersWomenCat.category_id,
                name: "Converse Chuck Taylor All Star",
                slug: "converse-chuck-taylor",
                description: "Classic canvas sneakers for women",
                price: 75.0,
                image_url: "https://example.com/converse_chuck.jpg",
            },
            {
                brand_id: adidasBrand.brand_id,
                category_id: sneakersKidsCat.category_id,
                name: "Adidas Kids Superstar",
                slug: "adidas-kids-superstar",
                description: "Comfortable sneakers for kids",
                price: 65.0,
                image_url: "https://example.com/adidas_kids_superstar.jpg",
            },
        ])
        .execute();

    // Get product IDs
    const pegasusProduct = await db
        .selectFrom("products")
        .select("product_id")
        .where("slug", "=", "nike-air-zoom-pegasus-40")
        .executeTakeFirstOrThrow();

    const ultraboostProduct = await db
        .selectFrom("products")
        .select("product_id")
        .where("slug", "=", "adidas-ultraboost-23")
        .executeTakeFirstOrThrow();

    const winfloProduct = await db
        .selectFrom("products")
        .select("product_id")
        .where("slug", "=", "nike-air-zoom-winflo-10")
        .executeTakeFirstOrThrow();

    const chuckTaylorProduct = await db
        .selectFrom("products")
        .select("product_id")
        .where("slug", "=", "converse-chuck-taylor")
        .executeTakeFirstOrThrow();

    const kidsSuperstarProduct = await db
        .selectFrom("products")
        .select("product_id")
        .where("slug", "=", "adidas-kids-superstar")
        .executeTakeFirstOrThrow();

    // Insert product variants
    await db
        .insertInto("product_variants")
        .values([
            {
                product_id: pegasusProduct.product_id,
                color: "Black",
                size: "42",
                stock: 10,
                sku: "NK-PEG-42-BLK",
            },
            {
                product_id: pegasusProduct.product_id,
                color: "White",
                size: "43",
                stock: 5,
                sku: "NK-PEG-43-WHT",
            },
            {
                product_id: ultraboostProduct.product_id,
                color: "Blue",
                size: "41",
                stock: 8,
                sku: "AD-UB23-41-BLU",
            },
            {
                product_id: winfloProduct.product_id,
                color: "Pink",
                size: "39",
                stock: 12,
                sku: "NK-WINFLO10-39-PNK",
            },
            {
                product_id: chuckTaylorProduct.product_id,
                color: "White",
                size: "38",
                stock: 15,
                sku: "CV-CHUCK-38-WHT",
            },
            {
                product_id: kidsSuperstarProduct.product_id,
                color: "White",
                size: "32",
                stock: 10,
                sku: "AD-KIDS-32-WHT",
            },
        ])
        .execute();

    // Get user IDs
    const johnUser = await db
        .selectFrom("users")
        .select("user_id")
        .where("username", "=", "john_doe")
        .executeTakeFirstOrThrow();

    const janeUser = await db
        .selectFrom("users")
        .select("user_id")
        .where("username", "=", "jane_smith")
        .executeTakeFirstOrThrow();

    // Insert carts
    await db
        .insertInto("cart")
        .values([{ user_id: johnUser.user_id }, { user_id: janeUser.user_id }])
        .execute();

    // Get cart IDs
    const johnCart = await db
        .selectFrom("cart")
        .select("cart_id")
        .where("user_id", "=", johnUser.user_id)
        .executeTakeFirstOrThrow();

    const janeCart = await db
        .selectFrom("cart")
        .select("cart_id")
        .where("user_id", "=", janeUser.user_id)
        .executeTakeFirstOrThrow();

    // Get variant IDs
    const pegasusBlackVariant = await db
        .selectFrom("product_variants")
        .select("variant_id")
        .where("sku", "=", "NK-PEG-42-BLK")
        .executeTakeFirstOrThrow();

    const chuckWhiteVariant = await db
        .selectFrom("product_variants")
        .select("variant_id")
        .where("sku", "=", "CV-CHUCK-38-WHT")
        .executeTakeFirstOrThrow();

    // Insert cart items
    await db
        .insertInto("cart_item")
        .values([
            {
                cart_id: johnCart.cart_id,
                variant_id: pegasusBlackVariant.variant_id,
                quantity: 1,
            },
            {
                cart_id: janeCart.cart_id,
                variant_id: chuckWhiteVariant.variant_id,
                quantity: 2,
            },
        ])
        .execute();

    // Insert orders
    await db
        .insertInto("orders")
        .values([
            {
                user_id: johnUser.user_id,
                status: sql`'PAID'::order_status`,
                total_amount: 120.0,
                payment: sql`'STRIPE'::payment_method`,
                shipping_address: "123 Main St, Hanoi",
            },
            {
                user_id: janeUser.user_id,
                status: sql`'PENDING'::order_status`,
                total_amount: 150.0,
                payment: sql`'COD'::payment_method`,
                shipping_address: "456 Le Loi, Ho Chi Minh City",
            },
        ])
        .execute();

    // Get order IDs
    const johnOrder = await db
        .selectFrom("orders")
        .select("order_id")
        .where("user_id", "=", johnUser.user_id)
        .executeTakeFirstOrThrow();

    const janeOrder = await db
        .selectFrom("orders")
        .select("order_id")
        .where("user_id", "=", janeUser.user_id)
        .executeTakeFirstOrThrow();

    // Insert order items
    await db
        .insertInto("order_item")
        .values([
            {
                order_id: johnOrder.order_id,
                variant_id: pegasusBlackVariant.variant_id,
                quantity: 1,
                price: 120.0,
            },
            {
                order_id: janeOrder.order_id,
                variant_id: chuckWhiteVariant.variant_id,
                quantity: 2,
                price: 75.0,
            },
        ])
        .execute();

    // Insert reviews
    await db
        .insertInto("reviews")
        .values([
            {
                user_id: johnUser.user_id,
                product_id: pegasusProduct.product_id,
                rating: 5,
                content: "Super comfortable and lightweight!",
            },
            {
                user_id: janeUser.user_id,
                product_id: chuckTaylorProduct.product_id,
                rating: 4,
                content: "Classic design, fits perfectly.",
            },
        ])
        .execute();

    // Insert wishlists
    await db
        .insertInto("wishlists")
        .values([
            {
                user_id: johnUser.user_id,
                product_id: ultraboostProduct.product_id,
            },
            {
                user_id: janeUser.user_id,
                product_id: pegasusProduct.product_id,
            },
        ])
        .execute();

    // Insert reset tokens
    await db
        .insertInto("resetTokens")
        .values([
            {
                email: "john@example.com",
                token: "token123abc",
                used: false,
                expiration: sql`NOW() + INTERVAL '1 day'`,
            },
            {
                email: "jane@example.com",
                token: "token456def",
                used: true,
                expiration: sql`NOW() - INTERVAL '1 day'`,
            },
        ])
        .execute();
}
