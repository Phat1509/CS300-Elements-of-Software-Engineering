import fs from "fs";

// CẤU HÌNH SỐ LƯỢNG
const PRODUCT_COUNT = 50;
const VARIANT_PER_PRODUCT = 6; // Mỗi giày có 6 biến thể (size/màu)

// DỮ LIỆU MẪU
const sizes = ["39", "40", "41", "42", "43"];
const colors = ["White", "Black", "Red"];
const brandsList = ["Nike", "Adidas", "Puma", "Converse"];

const orderStatus = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
const paymentMethods = ["COD", "STRIPE", "PAYSTACK"];

// KHỞI TẠO DB
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

/* =========================================
   1. BRANDS
   ========================================= */
brandsList.forEach((name, i) => {
  db.brands.push({
    brand_id: i + 1,
    name,
    description: `${name} represents generic sport fashion.`
  });
});

/* =========================================
   2. CATEGORIES
   ========================================= */
db.categories.push(
  { category_id: 1, name: "Men", slug: "men", description: "Men's Fashion", parent_id: null },
  { category_id: 2, name: "Women", slug: "women", description: "Women's Fashion", parent_id: null },
  { category_id: 3, name: "Sneakers", slug: "sneakers", description: "All Sneakers", parent_id: 1 } // Sneakers thuộc Men
);

/* =========================================
   3. PRODUCTS + VARIANTS
   ========================================= */
let variantIdCounter = 1;

for (let i = 1; i <= PRODUCT_COUNT; i++) {
  // Logic giá: Cơ bản 1.5tr + mỗi sp tăng 50k
  const basePrice = 1500000 + (i * 50000); 
  
  db.products.push({
    product_id: i,
    name: `Sneaker Model ${i}`,
    slug: `sneaker-model-${i}`,
    description: `High quality sneaker number ${i}. Breathable material, perfect for running and casual wear.`,
    price: basePrice, 
    discount_percentage: i % 5 === 0 ? 10 : null, // Mỗi 5 sp thì có 1 sp giảm giá 10%
    image_url: `/images/product-${i}.jpg`, // Đường dẫn giả định
    brand_id: (i % 4) + 1,
    category_id: 3,
    is_active: true,
    created_at: new Date().toISOString()
  });

  // Tạo variants cho sản phẩm này
  for (let v = 0; v < VARIANT_PER_PRODUCT; v++) {
    db.product_variants.push({
      variant_id: variantIdCounter++,
      product_id: i,
      size: sizes[v % sizes.length],
      color: colors[v % colors.length],
      sku: `SKU-${i}-${v}`, // SKU unique
      stock: Math.floor(Math.random() * 30) // Random tồn kho 0-30
    });
  }
}

/* =========================================
   4. USERS
   ========================================= */
db.users.push(
  {
    user_id: 1,
    username: "admin",
    email: "admin@gmail.com",
    password: "123", // Password giả để test
    fullname: "Super Admin",
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
    password: "123",
    fullname: "Nguyen Van A",
    roles: ["USER"],
    address: "123 Le Loi Street",
    city: "Ho Chi Minh",
    country: "VN",
    state: "District 1",
    phone: "0909123456",
    gender: "male",
    google_id: null,
    created_at: new Date().toISOString()
  }
);

/* =========================================
   5. CART (Giỏ hàng của User 2)
   ========================================= */
db.cart.push({
  cart_id: 1,
  user_id: 2,
  created_at: new Date().toISOString()
});

// Thêm 2 sản phẩm vào giỏ để test list
db.cart_item.push(
  {
    id: 1,
    cart_id: 1,
    variant_id: 1, // Variant của Product 1
    quantity: 2
  },
  {
    id: 2,
    cart_id: 1,
    variant_id: 8, // Variant của Product 2
    quantity: 1
  }
);

/* =========================================
   6. ORDERS (Đơn hàng cũ của User 2)
   ========================================= */
// Tính toán giá cho khớp để hiển thị lịch sử đơn hàng đẹp
const product1Price = 1500000 + (1 * 50000); // 1,550,000
const orderQty = 2;
const orderTotal = product1Price * orderQty;

db.orders.push({
  order_id: 1,
  user_id: 2,
  status: "DELIVERED",
  payment: "COD",
  shipping_address: "123 Le Loi, HCM",
  total_amount: orderTotal,
  created_at: new Date(Date.now() - 86400000).toISOString() // Cách đây 1 ngày
});

db.order_item.push({
  id: 1,
  order_id: 1,
  variant_id: 1, // Mua Product 1, variant 1
  price: product1Price, // Lưu giá tại thời điểm mua
  quantity: orderQty
});

/* =========================================
   7. WISHLIST & REVIEWS
   ========================================= */
db.wishlists.push({
  id: 1,
  user_id: 2,
  product_id: 5 // User thích sản phẩm số 5
});

db.reviews.push({
  review_id: 1,
  product_id: 1,
  user_id: 2,
  rating: 5,
  content: "Giày đi rất êm, giao hàng nhanh!",
  created_at: new Date().toISOString()
});

/* =========================================
   WRITE TO FILE
   ========================================= */
fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
console.log("✅ db.json generated successfully with " + PRODUCT_COUNT + " products.");