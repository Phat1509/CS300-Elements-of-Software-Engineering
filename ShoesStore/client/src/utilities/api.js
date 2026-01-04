import axios from "axios";

// 1. URL rỗng để sử dụng Proxy trong package.json ("proxy": "http://localhost:3001")
const API_URL = "";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

/* ===================== PRODUCTS ===================== */

export const getProducts = async (params = {}) => {
  try {
    const res = await api.get("/products", { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

const getProductByIdOrSlug = async (identifier) => {
  try {
    // Ưu tiên 1: Tìm theo slug
    let res = await api.get("/products", { params: { slug: identifier } });
    if (res.data && res.data.length > 0) return res.data[0];

    // Ưu tiên 2: Tìm theo id (của json-server)
    try {
      res = await api.get(`/products/${identifier}`);
      if (res.data) return res.data;
    } catch (e) {
      // Bỏ qua lỗi 404 nếu tìm theo ID thất bại
    }

    // Ưu tiên 3: Tìm theo id (dạng query param nếu id là string tùy chỉnh)
    res = await api.get("/products", { params: { id: identifier } });
    if (res.data && res.data.length > 0) return res.data[0];

    // Ưu tiên 4: Tìm theo product_id (trường custom)
    res = await api.get("/products", { params: { product_id: identifier } });
    return res.data[0] || null;
  } catch (error) {
    console.error(`Error finding product ${identifier}:`, error);
    return null;
  }
};

export const getProductVariants = async (productId) => {
  try {
    // Tìm các biến thể có product_id trùng khớp
    const res = await api.get("/product_variants", {
      params: { product_id: productId },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching variants:", error);
    return [];
  }
};

export const getProductDetail = async (identifier) => {
  const product = await getProductByIdOrSlug(identifier);
  if (!product) return null;

  // Lấy ID chuẩn để tìm variant
  const pId = product.product_id || product.id;

  // Fetch thủ công variants (an toàn hơn _embed nếu db chưa chuẩn relations)
  const variants = await getProductVariants(pId);

  return { ...product, variants };
};

// [QUAN TRỌNG] Update kho an toàn
export const updateProductStock = async (variantId, newStock) => {
  try {
    // Cách 1: Thử update trực tiếp theo ID (nếu variantId trùng với id của json-server)
    await api.patch(`/product_variants/${variantId}`, { stock: newStock });
  } catch (e) {
    // Cách 2: Nếu lỗi (do variantId là custom ID), tìm record trước rồi mới update
    console.warn(`Direct patch failed for ${variantId}, trying lookup...`);
    const res = await api.get(`/product_variants?variant_id=${variantId}`);

    if (res.data.length > 0) {
      const realId = res.data[0].id; // Lấy ID thật (vd: "abc-123")
      await api.patch(`/product_variants/${realId}`, { stock: newStock });
    } else {
      console.error(
        `CRITICAL: Không tìm thấy variant nào có ID: ${variantId} để trừ kho.`
      );
    }
  }
};

/* ===================== CATEGORIES ===================== */
export const getCategories = async () => {
  try {
    const res = await api.get("/categories");
    return res.data;
  } catch (error) {
    return [];
  }
};

/* ===================== CART ===================== */

export const getCartByUserId = async (userId) => {
  try {
    const res = await api.get("/cart", { params: { user_id: userId } });
    return res.data[0] || null;
  } catch (error) {
    return null;
  }
};

export const getCartItems = async (cartId) => {
  try {
    // Lưu ý: Kiểm tra db.json xem tên bảng là "cart_item" hay "cart_items"
    const res = await api.get("/cart_item", { params: { cart_id: cartId } });
    const items = res.data;

    // "Hydrate" dữ liệu: Từ ID lấy ra thông tin chi tiết (ảnh, tên, giá)
    const detailedItems = await Promise.all(
      items.map(async (item) => {
        // 1. Lấy thông tin Variant (Size/Color)
        let variant = null;
        try {
          // Tìm theo variant_id custom
          const vRes = await api.get(`/product_variants`, {
            params: { variant_id: item.variant_id },
          });
          variant = vRes.data[0];

          // Nếu không thấy, tìm theo id json-server
          if (!variant) {
            const vRes2 = await api.get(`/product_variants/${item.variant_id}`);
            variant = vRes2.data;
          }
        } catch (e) {}

        if (!variant) return null; // Variant đã bị xóa khỏi db, bỏ qua item này

        // 2. Lấy thông tin Product (Tên, Ảnh) từ variant.product_id
        let product = null;
        try {
          // Tìm theo product_id custom
          const pRes = await api.get(`/products`, {
            params: { product_id: variant.product_id },
          });
          product = pRes.data[0];

          // Nếu không thấy, tìm theo id json-server
          if (!product) {
            const pRes2 = await api.get(`/products/${variant.product_id}`);
            product = pRes2.data;
          }
        } catch (e) {}

        if (!product) return null;

        return {
          ...item,
          product_name: product.name,
          price: Number(product.price), // Đảm bảo là số
          image: product.image_url,
          size: variant.size,
          color: variant.color,
          slug: product.slug,
          stock: variant.stock,
          totalPrice: Number(product.price) * item.quantity,
        };
      })
    );
    // Lọc bỏ các item null (sản phẩm lỗi/đã xóa)
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
    quantity,
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

// Alias cho removeCartItem để tránh lỗi nếu gọi sai tên
export const deleteCartItem = removeCartItem;

/* ===================== ORDERS & AUTH ===================== */

export const createOrder = async (orderData) => {
  const res = await api.post("/orders", orderData);
  return res.data;
};

export const addOrderItem = async (itemData) => {
  // Lưu ý: db.json dùng "order_item" hay "order_items"?
  const res = await api.post("/order_item", itemData);
  return res.data;
};

export const getOrders = async (userId) => {
  const res = await api.get("/orders", {
    params: {
      user_id: userId,
      _sort: "created_at",
      _order: "desc",
    },
  });
  return res.data;
};

/**
 * LOGIN (đúng kiểu schema db.json):
 * - Query theo email
 * - Check password ở client (demo)
 * - Return {success, message, user}
 */
export const loginUser = async (email, password) => {
  const res = await api.get("/users", { params: { email } });

  if (!res.data || res.data.length === 0) {
    return { success: false, message: "Email không tồn tại" };
  }

  const user = res.data[0];

  if (user.password !== password) {
    return { success: false, message: "Sai mật khẩu" };
  }

  localStorage.setItem("user", JSON.stringify(user));
  return { success: true, user };
};

/**
 * REGISTER (có authority/roles):
 * - Check email
 * - Generate user_id tăng dần
 * - roles = [authority] (USER/ADMIN)
 * - Return {success, message, user}
 */
export const registerUser = async (user) => {
  const email = String(user?.email || "").trim().toLowerCase();
  const password = String(user?.password || "");
  const fullname = String(user?.fullname || "").trim();
  const username = String(user?.username || "").trim();
  const authority = String(user?.authority || "USER").toUpperCase();

  if (!fullname || !email || !password) {
    return { success: false, message: "Vui lòng nhập đầy đủ thông tin" };
  }

  // 1) Check trùng email
  const check = await api.get("/users", { params: { email } });
  if (check.data.length > 0) {
    return { success: false, message: "Email đã tồn tại" };
  }

  // 2) Generate user_id tăng dần
  const all = await api.get("/users");
  const maxUserId = (all.data || []).reduce(
    (max, u) => Math.max(max, Number(u.user_id) || 0),
    0
  );

  // 3) roles theo authority
  const role = authority === "ADMIN" ? "ADMIN" : "USER";

  const newUser = {
    user_id: maxUserId + 1,
    username: username || email.split("@")[0],
    fullname,
    email,
    password,
    roles: [role],
    created_at: new Date().toISOString(),
  };

  const res = await api.post("/users", newUser);

  localStorage.setItem("user", JSON.stringify(res.data));
  return { success: true, user: res.data };
};

/* ===================== WISHLIST & REVIEWS ===================== */

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
