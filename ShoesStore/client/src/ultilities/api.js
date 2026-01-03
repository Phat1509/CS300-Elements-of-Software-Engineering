// client/src/ultilities/api.js
import axios from "axios";

const API_URL = "http://localhost:3001"; // Lưu ý: Port này phải khớp với json-server đang chạy

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

/* ===================== PRODUCTS ===================== */

// Lấy toàn bộ products
export const getProducts = async (params = {}) => {
  const res = await api.get("/products", { params });
  return res.data;
};

// Lấy product theo slug
const getProductByIdOrSlug = async (identifier) => {
  // 1. Thử tìm theo slug trước
  let res = await api.get("/products", { params: { slug: identifier } });
  if (res.data && res.data.length > 0) return res.data[0];

  // 2. Nếu không thấy và identifier là số (hoặc chuỗi số), thử tìm theo id
  // Lưu ý: json-server dùng id là string hay number đều được
  res = await api.get("/products", { params: { id: identifier } });
  if (res.data && res.data.length > 0) return res.data[0];
    res = await api.get("/products", { params: { product_id: identifier } });
  
  return res.data[0] || null;
};

// Lấy variants theo product_id
export const getProductVariants = async (productId) => {
  const res = await api.get("/product_variants", {
    params: { product_id: productId }
  });
  return res.data; // ✅ ARRAY
};

// Product detail (product + variants)
export const getProductDetail = async (identifier) => {
  // Thay vì chỉ gọi getProductBySlug, ta gọi hàm đa năng ở trên
  const product = await getProductByIdOrSlug(identifier);
  
  if (!product) return null;

  // Lấy variants (giữ nguyên logic cũ của bạn)
  // Lưu ý: dùng product.id hoặc product.product_id tùy vào DB của bạn
  const pId = product.product_id || product.id; 
  const variants = await getProductVariants(pId);

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

/* ===================== CART (CORE LOGIC) ===================== */

export const getCartByUserId = async (userId) => {
  const res = await api.get("/cart", {
    params: { user_id: userId }
  });
  return res.data[0] || null;
};

// Hàm này đã được nâng cấp để Manual JOIN data
export const getCartItems = async (cartId) => {
  try {
    const res = await api.get("/cart_item", {
      params: { cart_id: cartId }
    });
    const items = res.data;

    // Lấy chi tiết từng item (Variant + Product info)
    const detailedItems = await Promise.all(
      items.map(async (item) => {
        // 1. Lấy thông tin Variant (Size, Color)
        const variantRes = await api.get(`/product_variants?variant_id=${item.variant_id}`);
        const variant = variantRes.data[0];

        if (!variant) return null; // Nếu variant bị xóa thì bỏ qua

        // 2. Lấy thông tin Product (Name, Image, Price)
        const productRes = await api.get(`/products?product_id=${variant.product_id}`);
        const product = productRes.data[0];

        if (!product) return null;

        return {
          ...item, // Giữ lại id, quantity của cart_item
          product_name: product.name,
          price: product.price,
          image: product.image_url,
          size: variant.size,
          color: variant.color,
          slug: product.slug, // Để link tới trang detail
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

/* ===================== AUTH (REAL MOCK) ===================== */

// Đổi tên thành loginUser để rõ ràng
export const loginUser = async (email, password) => {
  const res = await api.get("/users", {
    params: { email, password }
  });
  return res.data[0] || null;
};

// Đổi tên thành registerUser và thêm check trùng email
export const registerUser = async (user) => {
  // 1. Check tồn tại
  const check = await api.get("/users", { params: { email: user.email } });
  if (check.data.length > 0) {
    throw new Error("Email already exists");
  }

  // 2. Tạo mới
  const newUser = {
    ...user,
    roles: ["USER"], // Mặc định là user thường
    created_at: new Date().toISOString()
  };

  const res = await api.post("/users", newUser);
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