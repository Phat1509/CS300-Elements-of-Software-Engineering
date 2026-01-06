import axios from "axios";

const API_URL = "https://shoes-store.beerpsi.cc/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});



// ===================== AUTHENTICATION =====================
// 1. API Đăng nhập
export const loginAPI = async (email, password) => {
  // Gửi POST /auth/login 
  const response = await api.post('/auth/login', { email, password });
  return response.data; // Trả về { token, name, pid, is_verified }
};

// 2. API Đăng ký
export const registerAPI = async (name, email, password) => {
  // Gửi POST /auth/register 
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

// 3. API Lấy thông tin User hiện tại (khi F5 trang)
export const getMeAPI = async () => {
  // Gửi GET /auth/current
  const response = await api.get('/auth/current');
  return response.data; // Trả về { email, name, pid }
};


const mapProduct = (p) => {
  const isDummyLink = p.image_url && p.image_url.includes("example.com");
  
  return {
    ...p,
    id: p.id,
    product_id: p.id,
    name: p.name,
    // Nếu link ảnh là example.com hoặc không có ảnh -> dùng ảnh placeholder
    image: isDummyLink || !p.image_url 
           ? "https://placehold.co/400?text=No+Image" 
           : p.image_url,
    price: Number(p.price) || 0,
    // Lấy luôn tên brand và category từ object con (nếu cần hiển thị)
    brandName: p.brand?.name || "",
    categoryName: p.category?.name || "",
  };
};

/* ===================== PRODUCTS ===================== */

export const getProducts = async (params = {}) => {
  try {
    const res = await api.get("/products", { params });
    
    // API trả về object có chứa mảng 'items'
    const rawData = res.data.items || [];
    
    // Map dữ liệu
    return rawData.map(mapProduct);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};


export const getProductById = async (id) => {
  try {
    const res = await api.get(`/products/${id}`);
    

    const rawData = res.data.data || res.data; 

    return mapProduct(rawData);
  } catch (error) {
    console.error("Error fetching product detail:", error);
    return null;
  }
};






const getProductByIdOrSlug = async (identifier) => {
  try {
    let res = await api.get("/products", { params: { slug: identifier } });
    if (res.data && res.data.length > 0) return res.data[0];

    try {
      res = await api.get(`/products/${identifier}`);
      if (res.data) return res.data;
    } catch (e) {
    }

    res = await api.get("/products", { params: { id: identifier } });
    if (res.data && res.data.length > 0) return res.data[0];

    res = await api.get("/products", { params: { product_id: identifier } });
    return res.data[0] || null;
  } catch (error) {
    console.error(`Error finding product ${identifier}:`, error);
    return null;
  }
};

export const getProductVariants = async (productId) => {
  try {
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

  const pId = product.product_id || product.id;

  const variants = await getProductVariants(pId);

  return { ...product, variants };
};

export const updateProductStock = async (variantId, newStock) => {
  try {
    await api.patch(`/product_variants/${variantId}`, { stock: newStock });
  } catch (e) {
    console.warn(`Direct patch failed for ${variantId}, trying lookup...`);
    const res = await api.get(`/product_variants?variant_id=${variantId}`);

    if (res.data.length > 0) {
      const realId = res.data[0].id; // Lấy ID thật (vd: "abc-123")
      await api.patch(`/product_variants/${realId}`, { stock: newStock });
    } else {
      console.error(`CRITICAL: Không tìm thấy variant nào có ID: ${variantId} để trừ kho.`);
    }
  }
};

/* ===================== CATEGORIES ===================== */
export const getCategories = async () => {
  try {
    const res = await api.get("/categories");
    return res.data; // API categories thường trả về mảng luôn, hoặc bạn check log tương tự products
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
    const res = await api.get("/cart_item", { params: { cart_id: cartId } });
    const items = res.data;

    const detailedItems = await Promise.all(
      items.map(async (item) => {
        let variant = null;
        try {
          const vRes = await api.get(`/product_variants`, {
            params: { variant_id: item.variant_id },
          });
          variant = vRes.data[0];

          if (!variant) {
            const vRes2 = await api.get(`/product_variants/${item.variant_id}`);
            variant = vRes2.data;
          }
        } catch (e) {}

        if (!variant) return null;
        let product = null;
        try {
          const pRes = await api.get(`/products`, {
            params: { product_id: variant.product_id },
          });
          product = pRes.data[0];

          if (!product) {
            const pRes2 = await api.get(`/products/${variant.product_id}`);
            product = pRes2.data;
          }
        } catch (e) {}

        if (!product) return null;

        return {
          ...item,
          product_name: product.name,
          price: Number(product.price), 
          image: product.image_url,
          size: variant.size,
          color: variant.color,
          slug: product.slug,
          stock: variant.stock,
          totalPrice: Number(product.price) * item.quantity,
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

export const deleteCartItem = removeCartItem;

/* ===================== ORDERS */
export const createOrder = async (orderData) => {
  const res = await api.post("/orders", orderData);
  return res.data;
};

export const getOrderDetail = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order detail:", error);
    throw error;
  }
};

export const getOrderItems = async (orderId) => {
  try {
    const response = await api.get(`/order_item?order_id=${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order items:", error);
    return [];
  }
};

export const addOrderItem = async (itemData) => {
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

export const getOrdersByUserId = async (userId, altUserId) => {
  try {
    const ids = [userId, altUserId].filter((v) => v !== undefined && v !== null);

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await api.get("/orders", { params: { user_id: id } });
          return Array.isArray(res.data) ? res.data : [];
        } catch (e) {
          return [];
        }
      })
    );

    const merged = results.flat();

    const seen = new Set();
    const unique = [];
    for (const o of merged) {
      const key = o?.id ?? o?.order_id ?? JSON.stringify(o);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(o);
      }
    }

    unique.sort((a, b) => {
      const ta = new Date(a?.created_at || a?.createdAt || 0).getTime() || 0;
      const tb = new Date(b?.created_at || b?.createdAt || 0).getTime() || 0;
      return tb - ta;
    });

    return unique;
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn hàng:", error);
    return [];
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



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