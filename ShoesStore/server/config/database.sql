-- ENUM types
CREATE TYPE payment_method AS ENUM ('PAYSTACK', 'STRIPE', 'COD');
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- USERS TABLE
CREATE TABLE public.users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(200),
    fullname VARCHAR(100),
    phone VARCHAR(20),
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),  -- giới tính người dùng
    roles VARCHAR(10)[] DEFAULT '{customer}'::VARCHAR[] NOT NULL,
    google_id VARCHAR(100) UNIQUE,
    address VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BRANDS TABLE (e.g., Nike, Adidas, etc.)
CREATE TABLE public.brands (
    brand_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- CATEGORIES TABLE (Men/Women/Kids and subcategories)
CREATE TABLE public.categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES public.categories(category_id) ON DELETE CASCADE,
    UNIQUE (name, parent_id)
);

-- PRODUCTS TABLE
CREATE TABLE public.products (
    product_id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES public.brands (brand_id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES public.categories (category_id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCT VARIANTS (different size/color)
CREATE TABLE public.product_variants (
    variant_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES public.products (product_id) ON DELETE CASCADE,
    color VARCHAR(50),
    size VARCHAR(10),
    stock INTEGER NOT NULL CHECK (stock >= 0),
    sku VARCHAR(50) UNIQUE
);

-- CART TABLE
CREATE TABLE public.cart (
    cart_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users (user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CART ITEMS
CREATE TABLE public.cart_item (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES public.cart (cart_id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES public.product_variants (variant_id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    UNIQUE (cart_id, variant_id)
);

-- ORDERS TABLE
CREATE TABLE public.orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users (user_id) ON DELETE CASCADE,
    status order_status DEFAULT 'PENDING' NOT NULL,
    total_amount REAL NOT NULL,
    payment payment_method,
    shipping_address VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDER ITEMS
CREATE TABLE public.order_item (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES public.orders (order_id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES public.product_variants (variant_id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price REAL NOT NULL
);

-- REVIEWS TABLE
CREATE TABLE public.reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users (user_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products (product_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, product_id)
);

-- WISHLIST TABLE
CREATE TABLE public.wishlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users (user_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products (product_id) ON DELETE CASCADE,
    UNIQUE (user_id, product_id)
);

-- RESET TOKENS TABLE (for password reset)
CREATE TABLE public."resetTokens" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL,
    used BOOLEAN DEFAULT false NOT NULL,
    expiration TIMESTAMP
);

-- INDEXES
CREATE UNIQUE INDEX users_lower_email_idx ON public.users (LOWER(email));
CREATE UNIQUE INDEX users_lower_username_idx ON public.users (LOWER(username));



-- Sample data insertion
-- USERS
INSERT INTO public.users (username, email, password, fullname, phone, gender, roles, address, city, country)
VALUES
('john_doe', 'john@example.com', 'hashed_password_1', 'John Doe', '0123456789', 'Male', '{customer}', '123 Main St', 'Hanoi', 'Vietnam'),
('jane_smith', 'jane@example.com', 'hashed_password_2', 'Jane Smith', '0987654321', 'Female', '{customer}', '456 Le Loi', 'Ho Chi Minh City', 'Vietnam'),
('admin', 'admin@example.com', 'adminpass', 'Admin User', '0909090909', 'Other', '{admin}', '789 Tran Phu', 'Da Nang', 'Vietnam');

-- BRANDS
INSERT INTO public.brands (name, description)
VALUES
('Nike', 'Global sportswear and footwear brand'),
('Adidas', 'German sportswear manufacturer'),
('Converse', 'Classic sneaker and lifestyle shoe company');

-- CATEGORIES (Level 1)
INSERT INTO public.categories (name, slug) VALUES
('Men', 'men'),
('Women', 'women'),
('Kids', 'kids');

-- CATEGORIES (Level 2 - subcategories)
INSERT INTO public.categories (name, slug, parent_id)
VALUES
-- Men
('Running', 'running-men', (SELECT category_id FROM public.categories WHERE name='Men')),
('Sneakers', 'sneakers-men', (SELECT category_id FROM public.categories WHERE name='Men')),
('Casual', 'casual-men', (SELECT category_id FROM public.categories WHERE name='Men')),
-- Women
('Running', 'running-women', (SELECT category_id FROM public.categories WHERE name='Women')),
('Heels', 'heels-women', (SELECT category_id FROM public.categories WHERE name='Women')),
('Sneakers', 'sneakers-women', (SELECT category_id FROM public.categories WHERE name='Women')),
-- Kids
('Running', 'running-kids', (SELECT category_id FROM public.categories WHERE name='Kids')),
('Sneakers', 'sneakers-kids', (SELECT category_id FROM public.categories WHERE name='Kids'));

-- PRODUCTS
INSERT INTO public.products (brand_id, category_id, name, slug, description, price, image_url)
VALUES
-- Men
((SELECT brand_id FROM public.brands WHERE name='Nike'),
 (SELECT category_id FROM public.categories WHERE slug='running-men'),
 'Nike Air Zoom Pegasus 40', 'nike-air-zoom-pegasus-40', 'Lightweight running shoes for men', 120.0, 'https://example.com/nike_pegasus.jpg'),

((SELECT brand_id FROM public.brands WHERE name='Adidas'),
 (SELECT category_id FROM public.categories WHERE slug='sneakers-men'),
 'Adidas Ultraboost 23', 'adidas-ultraboost-23', 'High-performance men sneakers', 150.0, 'https://example.com/adidas_ultraboost.jpg'),

-- Women
((SELECT brand_id FROM public.brands WHERE name='Nike'),
 (SELECT category_id FROM public.categories WHERE slug='running-women'),
 'Nike Air Zoom Winflo 10', 'nike-air-zoom-winflo-10', 'Running shoes for women', 110.0, 'https://example.com/nike_winflo.jpg'),

((SELECT brand_id FROM public.brands WHERE name='Converse'),
 (SELECT category_id FROM public.categories WHERE slug='sneakers-women'),
 'Converse Chuck Taylor All Star', 'converse-chuck-taylor', 'Classic canvas sneakers for women', 75.0, 'https://example.com/converse_chuck.jpg'),

-- Kids
((SELECT brand_id FROM public.brands WHERE name='Adidas'),
 (SELECT category_id FROM public.categories WHERE slug='sneakers-kids'),
 'Adidas Kids Superstar', 'adidas-kids-superstar', 'Comfortable sneakers for kids', 65.0, 'https://example.com/adidas_kids_superstar.jpg');

-- PRODUCT VARIANTS
INSERT INTO public.product_variants (product_id, color, size, stock, sku)
VALUES
-- Nike Air Zoom Pegasus 40
((SELECT product_id FROM public.products WHERE slug='nike-air-zoom-pegasus-40'), 'Black', '42', 10, 'NK-PEG-42-BLK'),
((SELECT product_id FROM public.products WHERE slug='nike-air-zoom-pegasus-40'), 'White', '43', 5, 'NK-PEG-43-WHT'),

-- Adidas Ultraboost 23
((SELECT product_id FROM public.products WHERE slug='adidas-ultraboost-23'), 'Blue', '41', 8, 'AD-UB23-41-BLU'),

-- Nike Air Zoom Winflo 10
((SELECT product_id FROM public.products WHERE slug='nike-air-zoom-winflo-10'), 'Pink', '39', 12, 'NK-WINFLO10-39-PNK'),

-- Converse Chuck Taylor
((SELECT product_id FROM public.products WHERE slug='converse-chuck-taylor'), 'White', '38', 15, 'CV-CHUCK-38-WHT'),

-- Adidas Kids Superstar
((SELECT product_id FROM public.products WHERE slug='adidas-kids-superstar'), 'White', '32', 10, 'AD-KIDS-32-WHT');

-- CARTS
INSERT INTO public.cart (user_id)
VALUES
((SELECT user_id FROM public.users WHERE username='john_doe')),
((SELECT user_id FROM public.users WHERE username='jane_smith'));

-- CART ITEMS
INSERT INTO public.cart_item (cart_id, variant_id, quantity)
VALUES
((SELECT cart_id FROM public.cart WHERE user_id=(SELECT user_id FROM public.users WHERE username='john_doe')),
 (SELECT variant_id FROM public.product_variants WHERE sku='NK-PEG-42-BLK'), 1),

((SELECT cart_id FROM public.cart WHERE user_id=(SELECT user_id FROM public.users WHERE username='jane_smith')),
 (SELECT variant_id FROM public.product_variants WHERE sku='CV-CHUCK-38-WHT'), 2);

-- ORDERS
INSERT INTO public.orders (user_id, status, total_amount, payment, shipping_address)
VALUES
((SELECT user_id FROM public.users WHERE username='john_doe'), 'PAID', 120.0, 'STRIPE', '123 Main St, Hanoi'),
((SELECT user_id FROM public.users WHERE username='jane_smith'), 'PENDING', 150.0, 'COD', '456 Le Loi, Ho Chi Minh City');

-- ORDER ITEMS
INSERT INTO public.order_item (order_id, variant_id, quantity, price)
VALUES
((SELECT order_id FROM public.orders WHERE user_id=(SELECT user_id FROM public.users WHERE username='john_doe')),
 (SELECT variant_id FROM public.product_variants WHERE sku='NK-PEG-42-BLK'), 1, 120.0),

((SELECT order_id FROM public.orders WHERE user_id=(SELECT user_id FROM public.users WHERE username='jane_smith')),
 (SELECT variant_id FROM public.product_variants WHERE sku='CV-CHUCK-38-WHT'), 2, 75.0);

-- REVIEWS
INSERT INTO public.reviews (user_id, product_id, rating, content)
VALUES
((SELECT user_id FROM public.users WHERE username='john_doe'),
 (SELECT product_id FROM public.products WHERE slug='nike-air-zoom-pegasus-40'),
 5, 'Super comfortable and lightweight!'),

((SELECT user_id FROM public.users WHERE username='jane_smith'),
 (SELECT product_id FROM public.products WHERE slug='converse-chuck-taylor'),
 4, 'Classic design, fits perfectly.');

-- WISHLISTS
INSERT INTO public.wishlists (user_id, product_id)
VALUES
((SELECT user_id FROM public.users WHERE username='john_doe'),
 (SELECT product_id FROM public.products WHERE slug='adidas-ultraboost-23')),

((SELECT user_id FROM public.users WHERE username='jane_smith'),
 (SELECT product_id FROM public.products WHERE slug='nike-air-zoom-pegasus-40'));

-- RESET TOKENS
INSERT INTO public."resetTokens" (email, token, used, expiration)
VALUES
('john@example.com', 'token123abc', false, NOW() + INTERVAL '1 day'),
('jane@example.com', 'token456def', true, NOW() - INTERVAL '1 day');
