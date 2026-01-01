import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json"
  }
});

/* ===================== PRODUCTS ===================== */

// Lấy toàn bộ products
export const getProducts = async (params = {}) => {
  const res = await api.get("/products", { params });
  return res.data; // ✅ ARRAY
};

// Lấy product theo slug
export const getProductBySlug = async (slug) => {
  const res = await api.get("/products", { params: { slug } });
  return res.data[0] || null; // ✅ OBJECT
};

// Lấy variants theo product_id
export const getProductVariants = async (productId) => {
  const res = await api.get("/product_variants", {
    params: { product_id: productId }
  });
  return res.data; // ✅ ARRAY
};

// Product detail (product + variants)
export const getProductDetail = async (slug) => {
  const product = await getProductBySlug(slug);
  if (!product) return null;

  const variants = await getProductVariants(product.product_id);

  return {
    ...product,
    variants
  };
};

/* ===================== CATEGORIES ===================== */

export const getCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};

/* ===================== CART ===================== */

export const getCartByUserId = async (userId) => {
  const res = await api.get("/cart", {
    params: { user_id: userId }
  });
  return res.data[0] || null;
};

export const getCartItems = async (cartId) => {
  const res = await api.get("/cart_item", {
    params: { cart_id: cartId }
  });
  return res.data;
};

export const addToCart = async ({ cartId, variantId, quantity }) => {
  const res = await api.post("/cart_item", {
    cart_id: cartId,
    variant_id: variantId,
    quantity
  });
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

/* ===================== ORDERS ===================== */

export const createOrder = async (order, orderItems) => {
  const orderRes = await api.post("/orders", order);
  const orderId = orderRes.data.order_id;

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

export const getOrders = async () => {
  const res = await api.get("/orders");
  return res.data;
};

/* ===================== AUTH (MOCK) ===================== */

export const login = async ({ email, password }) => {
  const res = await api.get("/users", {
    params: { email, password }
  });
  return res.data[0] || null;
};

export const register = async (user) => {
  const res = await api.post("/users", user);
  return res.data;
};

/* ===================== WISHLIST ===================== */

export const getWishlist = async (userId) => {
  const res = await api.get("/wishlists", {
    params: { user_id: userId }
  });
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

/* ===================== REVIEWS ===================== */

export const getReviewsByProduct = async (productId) => {
  const res = await api.get("/reviews", {
    params: { product_id: productId }
  });
  return res.data;
};

export const addReview = async (review) => {
  const res = await api.post("/reviews", review);
  return res.data;
};

export default api;
