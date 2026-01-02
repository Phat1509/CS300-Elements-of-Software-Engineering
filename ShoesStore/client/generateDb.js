import fs from "fs";

const PRODUCT_COUNT = 50;
const VARIANT_PER_PRODUCT = 6;

const sizes = ["39", "40", "41", "42", "43"];
const colors = ["White", "Black", "Red"];

const orderStatus = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
const paymentMethods = ["COD", "STRIPE", "PAYSTACK"];

const db = {
  brands: [],
  categories: [],
  products: [],
  product_variants: [],
  users: [],
  cart: [],
  cart_item: [],
  orders: [],
  order_item: [],
  wishlists: [],
  reviews: [],
  sessions: [],
  resetTokens: []
};

/* ---------- BRANDS ---------- */
["Nike", "Adidas", "Puma", "Converse"].forEach((name, i) => {
  db.brands.push({
    brand_id: i + 1,
    name,
    description: `${name} brand`
  });
});

/* ---------- CATEGORIES ---------- */
db.categories.push(
  { category_id: 1, name: "Men", slug: "men", description: null, parent_id: null },
  { category_id: 2, name: "Women", slug: "women", description: null, parent_id: null },
  { category_id: 3, name: "Sneakers", slug: "sneakers", description: null, parent_id: 1 }
);

/* ---------- PRODUCTS + VARIANTS ---------- */
let variantId = 1;

for (let i = 1; i <= PRODUCT_COUNT; i++) {
  db.products.push({
    product_id: i,
    name: `Sneaker Model ${i}`,
    slug: `sneaker-model-${i}`,
    description: `High quality sneaker number ${i}`,
    price: 1500000 + i * 50000,
    discount_percentage: i % 5 === 0 ? 10 : null,
    image_url: `/images/product-${i}.jpg`,
    brand_id: (i % 4) + 1,
    category_id: 3,
    is_active: true,
    created_at: new Date().toISOString()
  });

  for (let v = 0; v < VARIANT_PER_PRODUCT; v++) {
    db.product_variants.push({
      variant_id: variantId++,
      product_id: i,
      size: sizes[v % sizes.length],
      color: colors[v % colors.length],
      sku: `SKU-${i}-${v}`,
      stock: Math.floor(Math.random() * 30)
    });
  }
}

/* ---------- USERS ---------- */
db.users.push(
  {
    user_id: 1,
    username: "admin",
    email: "admin@gmail.com",
    password: "123456",
    fullname: "Admin User",
    roles: ["ADMIN"],
    address: null,
    city: null,
    country: "VN",
    state: null,
    phone: null,
    gender: null,
    google_id: null,
    created_at: new Date().toISOString()
  },
  {
    user_id: 2,
    username: "user01",
    email: "user@gmail.com",
    password: "123456",
    fullname: "Normal User",
    roles: ["USER"],
    address: "HCM City",
    city: "HCM",
    country: "VN",
    state: null,
    phone: "0123456789",
    gender: "male",
    google_id: null,
    created_at: new Date().toISOString()
  }
);

/* ---------- CART ---------- */
db.cart.push({
  cart_id: 1,
  user_id: 2,
  created_at: new Date().toISOString()
});

db.cart_item.push({
  id: 1,
  cart_id: 1,
  variant_id: 1,
  quantity: 2
});

/* ---------- ORDERS ---------- */
db.orders.push({
  order_id: 1,
  user_id: 2,
  status: orderStatus[0],
  payment: paymentMethods[0],
  shipping_address: "Ho Chi Minh City",
  total_amount: 3000000,
  created_at: new Date().toISOString()
});

db.order_item.push({
  id: 1,
  order_id: 1,
  variant_id: 1,
  price: 1500000,
  quantity: 2
});

/* ---------- WISHLIST ---------- */
db.wishlists.push({
  id: 1,
  user_id: 2,
  product_id: 1
});

/* ---------- REVIEWS ---------- */
db.reviews.push({
  review_id: 1,
  product_id: 1,
  user_id: 2,
  rating: 5,
  content: "Very good quality!",
  created_at: new Date().toISOString()
});

/* ---------- WRITE FILE ---------- */
fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
console.log("✅ db.json generated successfully");
