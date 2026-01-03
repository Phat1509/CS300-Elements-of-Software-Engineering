import axios from "axios";

// 1. Sửa thành chuỗi rỗng để ăn theo Proxy (http://localhost:3001) trong package.json
const API_URL = ""; 

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

/* ===================== PRODUCTS ===================== */

export const getProducts = async (params = {}) => {
  const res = await api.get("/products", { params });
  return res.data;
};

// ... (Giữ nguyên các hàm getProductByIdOrSlug, getProductVariants, getProductDetail cũ của bạn) ...
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

// [QUAN TRỌNG - ĐÃ SỬA] Update kho an toàn hơn
export const updateProductStock = async (variantId, newStock) => {
  // Bước 1: Tìm xem record nào chứa variant_id này (đề phòng id của dòng đó khác variantId)
  // Thử tìm theo id trước
  try {
      await api.patch(`/product_variants/${variantId}`, { stock: newStock });
      return; // Nếu thành công thì xong
  } catch (e) {
      // Nếu lỗi 404 (không tìm thấy id đó), ta tìm theo cột variant_id
      const res = await api.get(`/product_variants?variant_id=${variantId}`);
      if (res.data.length > 0) {
          const realId = res.data[0].id; // Lấy ID thật của json-server
          const updateRes = await api.patch(`/product_variants/${realId}`, { stock: newStock });
          return updateRes.data;
      } else {
         console.warn(`Không tìm thấy variant nào có ID: ${variantId} để trừ kho.`);
      }
  }
};

/* ===================== CATEGORIES ===================== */
export const getCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};

/* ===================== CART ===================== */
// ... (Giữ nguyên phần CART cũ của bạn) ...
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
        // Sửa logic lấy variant để tránh null
        const variantRes = await api.get(`/product_variants`, { params: { variant_id: item.variant_id } });
        // Hoặc tìm theo id nếu db lưu id
        let variant = variantRes.data[0];
        
        // Fallback: Nếu tìm theo variant_id không thấy, thử tìm theo id
        if (!variant) {
             try {
                const vRes2 = await api.get(`/product_variants/${item.variant_id}`);
                variant = vRes2.data;
             } catch (e) {}
        }

        if (!variant) return null; // Variant đã bị xóa khỏi db

        const productRes = await api.get(`/products?product_id=${variant.product_id}`);
        // Fallback: Tìm theo id
        let product = productRes.data[0];
        if(!product) {
             try {
                const pRes2 = await api.get(`/products/${variant.product_id}`);
                product = pRes2.data;
             } catch (e) {}
        }
        
        if (!product) return null;

        return {
          ...item, 
          product_name: product.name,
          price: product.price,
          image: product.image_url, // Đảm bảo trường này đúng tên trong db
          size: variant.size,
          color: variant.color,
          slug: product.slug, 
          stock: variant.stock, 
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

export const deleteCartItem = removeCartItem;

/* ===================== ORDERS & AUTH (Giữ nguyên) ===================== */
export const createOrder = async (orderData) => {
  const res = await api.post("/orders", orderData);
  return res.data; 
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
          _order: "desc"
      } 
  });
  return res.data;
};

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

// ... Các phần Wishlist/Review giữ nguyên ...
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