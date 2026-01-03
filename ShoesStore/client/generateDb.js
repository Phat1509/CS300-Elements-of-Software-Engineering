import fs from "fs";

// CẤU HÌNH SỐ LƯỢNG
const PRODUCT_COUNT = 50;

// DỮ LIỆU MẪU
const sizes = ["39", "40", "41", "42", "43"];
const colors = ["White", "Black", "Red"]; // Có thể thêm màu nếu muốn
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
  { category_id: 3, name: "Sneakers", slug: "sneakers", description: "All Sneakers", parent_id: 1 }
);

/* =========================================
   3. PRODUCTS + VARIANTS
   ========================================= */
let variantIdCounter = 1;

for (let i = 1; i <= PRODUCT_COUNT; i++) {
  // Logic giá: Cơ bản 1.5tr + mỗi sp tăng 50k
  const basePrice = 1500000 + (i * 50000); 
  
  // Tạo Product
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

  // --- LOGIC MỚI: TẠO FULL VARIANTS (Size x Color) ---
  // Duyệt qua từng Size
  sizes.forEach((size) => {
    // Với mỗi Size, duyệt qua từng Màu
    colors.forEach((color) => {
      
      db.product_variants.push({
        variant_id: variantIdCounter++,
        product_id: i,
        size: size,
        color: color,
        // SKU gợi nhớ: SP-Size-Màu (VD: SKU-1-39-Red)
        sku: `SKU-${i}-${size}-${color}`, 
        // Random tồn kho từ 5 đến 35 để đảm bảo luôn có hàng test
        stock: Math.floor(Math.random() * 30) + 5 
      });

    });
  });
}

/* =========================================
   4. USERS
   ========================================= */
db.users.push(
  {
    user_id: 1,
    username: "admin",
    email: "admin@gmail.com",
    password: "123",
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
   5. CART
   ========================================= */
db.cart.push({
  cart_id: 1,
  user_id: 2,
  created_at: new Date().toISOString()
});

db.cart_item.push(
  {
    id: 1,
    cart_id: 1,
    variant_id: 1, // Chắc chắn tồn tại (Product 1, Size 39, White)
    quantity: 2
  },
  {
    id: 2,
    cart_id: 1,
    variant_id: 16, // Variant ID 16 sẽ thuộc về Product 2 (vì Product 1 có 15 variants: 5 sizes * 3 colors)
    quantity: 1
  }
);

/* =========================================
   6. ORDERS
   ========================================= */
const product1Price = 1500000 + (1 * 50000); 
const orderQty = 2;
const orderTotal = product1Price * orderQty;

db.orders.push({
  order_id: 1,
  user_id: 2,
  status: "DELIVERED",
  payment: "COD",
  shipping_address: "123 Le Loi, HCM",
  total_amount: orderTotal,
  created_at: new Date(Date.now() - 86400000).toISOString()
});

db.order_item.push({
  id: 1,
  order_id: 1,
  variant_id: 1, 
  price: product1Price,
  quantity: orderQty
});

/* =========================================
   7. WISHLIST & REVIEWS
   ========================================= */
db.wishlists.push({
  id: 1,
  user_id: 2,
  product_id: 5 
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
console.log(`✅ db.json generated successfully.`);
console.log(`- Products: ${PRODUCT_COUNT}`);
console.log(`- Variants per product: ${sizes.length * colors.length} (Full Matrix)`);