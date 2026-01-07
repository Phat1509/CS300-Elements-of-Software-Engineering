// client/src/utilities/adminApi.js

const BASE = process.env.REACT_APP_API_URL  ; 
// Hàm lấy token từ user đã đăng nhập
function getToken() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.token; // Giả sử lúc login bạn lưu object có field token
  } catch {
    return null;
  }
}

async function safeJson(res) {
  if (!res) return null;
  try {
    if (res.ok) return await res.json();
    const txt = await res.text().catch(() => '<no body>');
    console.warn(`[adminApi] non-OK ${res.status} ${res.url}: ${txt}`);
    throw new Error(`Server returned ${res.status}: ${txt}`);
  } catch (e) {
    console.warn('[adminApi] safeJson error', e);
    throw e;
  }
}

async function request(path, opts = {}) {
  const token = getToken();
  
  // Tự động thêm Header Authorization
  const headers = {
    'Content-Type': 'application/json',
    ...opts.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  return safeJson(res);
}

// --- PRODUCTS ---

export async function getAllProducts() {
  try {
    // 1. Gọi API lấy danh sách
    const res = await request('/api/products?page=1&page_size=1000');
    
    console.log("Dữ liệu Products từ Backend:", res); // Dòng này giúp debug

    // 2. Xử lý các trường hợp dữ liệu trả về khác nhau
    let list = [];

    if (Array.isArray(res)) {
      // Trường hợp 1: Backend trả về luôn một mảng [ {...}, {...} ]
      list = res;
    } else if (res && Array.isArray(res.items)) {
      // Trường hợp 2: Loco trả về { items: [...] }
      list = res.items;
    } else if (res && Array.isArray(res.results)) {
      // Trường hợp 3: Một số framework khác trả về { results: [...] }
      list = res.results;
    }

    // 3. Map dữ liệu để tránh lỗi "undefined"
    return list.map(item => {
      // Nếu item bị null/undefined thì bỏ qua (trả về object rỗng để không crash)
      if (!item) return {}; 
      
      // Nếu cấu trúc lồng nhau: { product: {id:1...}, brand:... }
      if (item.product && typeof item.product === 'object') {
        return item.product;
      }
      
      // Nếu cấu trúc phẳng: { id:1, name:... } (Đây là trường hợp của bạn)
      return item;
    });

  } catch (error) {
    console.error("Lỗi lấy danh sách sản phẩm:", error);
    return [];
  }
}

export async function createProduct(payload) {
  // Payload phải khớp với struct ProductCreateParams bên Rust
  return request('/api/products', { 
    method: 'POST', 
    body: JSON.stringify(payload) 
  });
}

export async function updateProduct(id, payload) {
  return request(`/api/products/${id}`, { 
    method: 'PATCH', 
    body: JSON.stringify(payload) 
  });
}

export async function deleteProduct(id) {
  return request(`/api/products/${id}`, { method: 'DELETE' });
}

// --- ORDERS (ADMIN) ---
// (Phần này sẽ update sau khi bạn gửi code Order backend, tạm thời giữ nguyên cấu trúc)
export async function getOrders() {
  return request('/api/orders') || []; 
}

export async function updateOrderStatus(orderId, status) {
  return request(`/api/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export default { 
    createProduct, 
    updateProduct, 
    getAllProducts, 
    deleteProduct, 
    getOrders, 
    updateOrderStatus 
};