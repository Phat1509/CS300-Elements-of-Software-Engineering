// client/src/ultilities/api.js
import axios from "axios";

const API_URL = "http://localhost:3001"; 

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

/* ===================== PRODUCTS ===================== */

export const getProducts = async (params = {}) => {
  const res = await api.get("/products", { params });
  return res.data;
};

const getProductByIdOrSlug = async (identifier) => {
  let res = await api.get("/products", { params: { slug: identifier } });
  if (res.data && res.data.length > 0) return res.data[0];

  res = await api.get("/products", { params: { id: identifier } });
  if (res.data && res.data.length > 0) return res.data[0];
  
  res = await api.get("/products", { params: { product_id: identifier } });
  return res.data[0] || null;
};

export const getProductVariants = async (productId) => {
  const res = await api.get("/product_variants", {
    params: { product_id: productId }
  });
  return res.data; 
};

export const getProductDetail = async (identifier) => {
  const product = await getProductByIdOrSlug(identifier);
  if (!product) return null;

  const pId = product.product_id || product.id; 
  const variants = await getProductVariants(pId);

  return { ...product, variants };
};

// [QUAN TRỌNG] Cập nhật tồn kho sau khi mua
export const updateProductStock = async (variantId, newStock) => {
  const res = await api.patch(`/product_variants/${variantId}`, {
    stock: newStock
  });
  return res.data;
};

/* ===================== CATEGORIES ===================== */

export const getCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};

/* ===================== CART ===================== */

export const getCartByUserId = async (userId) => {
  const res = await api.get("/cart", { params: { user_id: userId } });
  return res.data[0] || null;
};

export const getCartItems = async (cartId) => {
  try {
    const res = await api.get("/cart_item", { params: { cart_id: cartId } });
    const items = res.data;

    const detailedItems = await Promise.all(
      items.map(async (item) => {
        const variantRes = await api.get(`/product_variants?variant_id=${item.variant_id}`);
        const variant = variantRes.data[0];
        if (!variant) return null;

        const productRes = await api.get(`/products?product_id=${variant.product_id}`);
        const product = productRes.data[0];
        if (!product) return null;

        return {
          ...item, 
          product_name: product.name,
          price: product.price,
          image: product.image_url,
          size: variant.size,
          color: variant.color,
          slug: product.slug, 
          stock: variant.stock, // Lấy stock để validate
          totalPrice: product.price * item.quantity,
        };
      })
    );
    return detailedItems.filter((i) => i !== null);
  } catch (error) {
    console.error("Error getting cart details:", error);
    return [];
  }
};

export const addToCart = async ({ cartId, variantId, quantity }) => {
  const res = await api.post("/cart_item", { cart_id: cartId, variant_id: variantId, quantity });
  return res.data;
};

export const updateCartItem = async (id, quantity) => {
  const res = await api.patch(`/cart_item/${id}`, { quantity });
  return res.data;
};

export const removeCartItem = async (id) => {
  const res = await api.delete(`/cart_item/${id}`);
  return res.data;
};

// Alias cho dễ đọc trong logic Checkout
export const deleteCartItem = removeCartItem;

/* ===================== ORDERS (USER SIDE) ===================== */

// 1. Chỉ tạo Order (Header)
export const createOrder = async (orderData) => {
  const res = await api.post("/orders", orderData);
  return res.data; 
};

// 2. Thêm từng item vào Order (Detail)
export const addOrderItem = async (itemData) => {
  const res = await api.post("/order_item", itemData);
  return res.data;
};

// 3. Lấy lịch sử đơn hàng của User
export const getOrders = async (userId) => {
    // Dùng _sort và _order của json-server để lấy đơn mới nhất trước
  const res = await api.get("/orders", { 
      params: { 
          user_id: userId,
          _sort: "created_at",
          _order: "desc"
      } 
  });
  return res.data;
};

/* ===================== AUTH ===================== */

export const loginUser = async (email, password) => {
  const res = await api.get("/users", { params: { email, password } });
  return res.data[0] || null;
};

export const registerUser = async (user) => {
  const check = await api.get("/users", { params: { email: user.email } });
  if (check.data.length > 0) throw new Error("Email already exists");

  const newUser = { ...user, roles: ["USER"], created_at: new Date().toISOString() };
  const res = await api.post("/users", newUser);
  return res.data;
};

/* ===================== WISHLIST & REVIEWS ===================== */
// (Giữ nguyên logic cũ của bạn)
export const getWishlist = async (userId) => {
  const res = await api.get("/wishlists", { params: { user_id: userId } });
  return res.data;
};
export const addWishlist = async (data) => {
  const res = await api.post("/wishlists", data);
  return res.data;
};
export const removeWishlist = async (id) => {
  const res = await api.delete(`/wishlists/${id}`);
  return res.data;
};
export const getReviewsByProduct = async (productId) => {
  const res = await api.get("/reviews", { params: { product_id: productId } });
  return res.data;
};
export const addReview = async (review) => {
  const res = await api.post("/reviews", review);
  return res.data;
};

export default api;