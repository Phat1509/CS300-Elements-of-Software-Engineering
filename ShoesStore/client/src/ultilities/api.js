import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

/* ===================== PRODUCTS ===================== */

// Lấy toàn bộ product (có thể filter)
export const getProducts = (params = {}) => {
  return api.get("/products", { params });
};

// Lấy product theo slug
export const getProductBySlug = async (slug) => {
  const res = await api.get("/products", {
    params: { slug }
  });
  return res.data[0]; // json-server trả về array
};

// Lấy variants theo product_id
export const getProductVariants = (productId) => {
  return api.get("/product_variants", {
    params: { product_id: productId }
  });
};

// Lấy product + variants (dùng cho ProductDetail)
export const getProductDetail = async (slug) => {
  const product = await getProductBySlug(slug);
  if (!product) return null;

  const variantsRes = await getProductVariants(product.product_id);

  return {
    ...product,
    variants: variantsRes.data
  };
};

/* ===================== CATEGORIES ===================== */

export const getCategories = () => api.get("/categories");

/* ===================== CART ===================== */

// Lấy cart của user
export const getCartByUserId = async (userId) => {
  const res = await api.get("/cart", {
    params: { user_id: userId }
  });
  return res.data[0];
};

// Lấy cart items theo cart_id
export const getCartItems = (cartId) => {
  return api.get("/cart_item", {
    params: { cart_id: cartId }
  });
};

// Add item vào cart (THEO VARIANT)
export const addToCart = async ({ cartId, variantId, quantity }) => {
  return api.post("/cart_item", {
    cart_id: cartId,
    variant_id: variantId,
    quantity
  });
};

// Update quantity
export const updateCartItem = (id, quantity) => {
  return api.patch(`/cart_item/${id}`, { quantity });
};

// Remove item
export const removeCartItem = (id) => {
  return api.delete(`/cart_item/${id}`);
};

/* ===================== ORDERS ===================== */

export const createOrder = async (order, orderItems) => {
  // 1. tạo order
  const orderRes = await api.post("/orders", order);
  const orderId = orderRes.data.order_id;

  // 2. tạo order_item
  await Promise.all(
    orderItems.map((item) =>
      api.post("/order_item", {
        order_id: orderId,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price
      })
    )
  );

  return orderRes.data;
};

export const getOrders = () => api.get("/orders");

/* ===================== AUTH (MOCK) ===================== */

export const login = async ({ email, password }) => {
  const res = await api.get("/users", {
    params: { email, password }
  });
  return res.data[0] || null;
};

export const register = (user) => {
  return api.post("/users", user);
};

/* ===================== WISHLIST ===================== */

export const getWishlist = (userId) =>
  api.get("/wishlists", { params: { user_id: userId } });

export const addWishlist = (data) =>
  api.post("/wishlists", data);

export const removeWishlist = (id) =>
  api.delete(`/wishlists/${id}`);

/* ===================== REVIEWS ===================== */

export const getReviewsByProduct = (productId) =>
  api.get("/reviews", { params: { product_id: productId } });

export const addReview = (review) =>
  api.post("/reviews", review);

export default api;
