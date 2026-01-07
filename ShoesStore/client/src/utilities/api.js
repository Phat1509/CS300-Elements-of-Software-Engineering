import axios from "axios";

const API_URL = "https://shoes-store.beerpsi.cc/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===================== XÁC THỰC (AUTHENTICATION) =====================
export const loginAPI = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const registerAPI = async (name, email, password) => {
  const response = await api.post("/auth/register", { name, email, password });
  return response.data;
};

export const getMeAPI = async () => {
  const response = await api.get("/auth/current");
  return response.data;
};

export const updateProfileAPI = async (name) => {
  const response = await api.post("/auth/profile", { name }); // patch -> post
  return response.data;
};

// ===================== HÀM HỖ TRỢ ÁNH XẠ (MAPPER) =====================
const mapProduct = (p) => {
  const isDummyLink = p.image_url && p.image_url.includes("example.com");
  return {
    ...p,
    id: p.id,
    product_id: p.id,
    name: p.name,
    image:
      isDummyLink || !p.image_url
        ? "https://placehold.co/400?text=Kh%C3%B4ng+c%C3%B3+%E1%BA%A3nh"
        : p.image_url,
    price: Number(p.price) || 0,
    brandName: p.brand?.name || "",
    categoryName: p.category?.name || "",
  };
};

/* ===================== SẢN PHẨM (PRODUCTS) ===================== */
export const getProducts = async (params = {}) => {
  try {
    const res = await api.get("/products", { params });
    const rawData = res.data.items || [];
    return rawData.map(mapProduct);
  } catch (error) {
    console.error("Error when loading product lists", error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const res = await api.get(`/products/${id}`);
    const rawData = res.data.data || res.data;
    return mapProduct(rawData);
  } catch (error) {
    console.error("Error when loading", error);
    return null;
  }
};

/* ===================== GIỎ HÀNG (CART) ===================== */

export const getCartItems = async () => {
  try {
    const res = await api.get("/cart");
    // API trả về mảng trực tiếp: [{ id, quantity, product: {...}, product_variant: {...} }]
    const rawItems = res.data || [];

    if (!Array.isArray(rawItems)) return [];

    console.log("Dữ liệu giỏ hàng từ API (thô):", rawItems); // Log để kiểm tra

    return rawItems.map((item) => {
      // Dựa trên JSON bạn gửi: item chính là cart item, bên trong có product và product_variant
      const product = item.product || {};
      const variant = item.product_variant || {};

      // Ưu tiên ảnh của variant, nếu không có thì lấy ảnh product
      const imageUrl = variant.image || product.image_url || product.image;

      return {
        // ID dùng để định danh khi render danh sách
        id: variant.id,

        // Các ID quan trọng
        variant_id: variant.id,
        cart_item_id: item.id, // Đây là ID số 3 trong ảnh
        product_id: product.id, // Đây là ID số 5 trong ảnh

        // Thông tin hiển thị
        product_name: product.name,
        price: Number(product.price),
        quantity: item.quantity, // Lấy trực tiếp, không qua cart_item
        totalPrice: Number(product.price) * item.quantity,

        // Thuộc tính
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
        image: imageUrl || "https://placehold.co/100x100?text=Kh%C3%B4ng+c%C3%B3+%E1%BA%A3nh",
        slug: product.slug,
      };
    });
  } catch (error) {
    console.error("Lỗi getCartItems:", error);
    return [];
  }
};

export const addToCart = async (data) => {
  // data: { variant_id, quantity }
  const payload = {
    product_variant_id: parseInt(data.variant_id || data.product_variant_id),
    quantity: parseInt(data.quantity || 1),
  };

  if (!payload.product_variant_id || isNaN(payload.product_variant_id)) {
    throw new Error(`ProductID error: ${payload.product_variant_id}`);
  }

  const response = await api.post("/cart", payload);
  return response.data;
};

export const updateCartItem = async (variantId, quantity) => {
  const res = await api.patch(`/cart/${variantId}`, { quantity });
  return res.data;
};

export const removeCartItem = async (variantId) => {
  const res = await api.delete(`/cart/${variantId}`);
  return res.data;
};

// === SỬA LỖI 1: Thêm alias này vì CartPage đang dùng tên cũ ===
export const deleteCartItem = removeCartItem;

/* ===================== ĐƠN HÀNG (ORDERS) ===================== */

// === SỬA LỖI 2: Thêm hàm tạo đơn hàng ===
export const createOrder = async (orderData) => {
  const res = await api.post("/orders", orderData);
  return res.data;
};

export const getOrders = async (userId) => {
  const res = await api.get("/orders", {
    params: { user_id: userId, _sort: "created_at", _order: "desc" },
  });
  return res.data;
};

export const getOrderDetail = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const addOrderItem = async (itemData) => {
  const res = await api.post("/order_item", itemData);
  return res.data;
};

export const getOrdersByUserId = async (userId) => {
  // Giữ lại hàm cũ nếu có dùng
  return getOrders(userId);
};

/* ===================== DANH SÁCH YÊU THÍCH (WISHLIST) ===================== */
export const getWishlist = async (userId) => {
  const uid = parseInt(userId);
  if (!uid || isNaN(uid)) return [];
  const res = await api.get("/wishlists", { params: { user_id: uid } });
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

/* ===================== KHÁC (OTHERS) ===================== */
export const getCategories = async () => {
  try {
    const res = await api.get("/categories");
    return res.data;
  } catch {
    return [];
  }
};

export const getProductVariants = async (pid) => {
  try {
    const res = await api.get("/product_variants", { params: { product_id: pid } });
    return res.data;
  } catch {
    return [];
  }
};

export const getReviewsByProduct = async (pid) => {
  try {
    const res = await api.get("/reviews", { params: { product_id: pid } });
    return res.data;
  } catch {
    return [];
  }
};

export const addReview = async (data) => {
  const res = await api.post("/reviews", data);
  return res.data;
};

export const updateProductStock = async (variantId, stock) => {
  await api.patch(`/product_variants/${variantId}`, { stock });
};

export const getProductDetail = async (id) => getProductById(id);

export default api;
