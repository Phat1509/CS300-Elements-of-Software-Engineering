// client/src/utilities/adminApi.js
const BASE = process.env.REACT_APP_API_URL;

function getToken() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
        const user = JSON.parse(userStr);
        return user.token;
    } catch {
        return null;
    }
}

async function safeJson(res) {
    if (!res) return null;
    try {
        if (res.ok) return await res.json();
        const txt = await res.text().catch(() => '<no body>');
        throw new Error(`Server returned ${res.status}: ${txt}`);
    } catch (e) {
        throw e;
    }
}

async function request(path, opts = {}) {
    const token = getToken();
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

// ---  PRODUCTS (CRUD) ---
export async function getAllProducts() {
    try {
        const res = await request('/api/products?page=1&page_size=1000');
        let list = Array.isArray(res) ? res : (res?.items || res?.results || []);
        return list.map(item => item.product && typeof item.product === 'object' ? item.product : item);
    } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error);
        return [];
    }
}

export async function createProduct(payload) {
    return request('/api/products', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateProduct(id, payload) {
    return request(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteProduct(id) {
    return request(`/api/products/${id}`, { method: 'DELETE' });
}

// --- PRODUCT VARIANTS (CRUD) ---
export async function getVariants(productId) {
    return request(`/api/products/${productId}/variants`);
}

export async function createVariant(productId, payload) {
    return request(`/api/products/${productId}/variants`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export async function updateVariant(productId, variantId, payload) {
    return request(`/api/products/${productId}/variants/${variantId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });
}

export async function deleteVariant(productId, variantId) {
    return request(`/api/products/${productId}/variants/${variantId}`, {
        method: 'DELETE'
    });
}

// --- BRANDS (CRUD) ---
export async function getBrands() {
    return request('/api/brands');
}

export async function createBrand(payload) {
    return request('/api/brands', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateBrand(id, payload) {
    return request(`/api/brands/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteBrand(id) {
    return request(`/api/brands/${id}`, { method: 'DELETE' });
}

// ---  CATEGORIES (CRUD) ---
export async function getCategories() {
    return request('/api/categories');
}

export async function createCategory(payload) {
    return request('/api/categories', { method: 'POST', body: JSON.stringify(payload) });
}

export async function deleteCategory(id) {
    return request(`/api/categories/${id}`, { method: 'DELETE' });
}

// ---  ORDERS (ADMIN) ---
export async function getOrders() {
    return request('/api/orders');
}

export async function getOrderDetails(id) {
    return request(`/api/orders/${id}`);
}

export async function updateOrderStatus(orderId, status) {
    return request(`/api/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });
}

export async function cancelOrder(id) {
    return request(`/api/orders/${id}/cancel`, { method: 'POST' });
}

const adminApi = {
    getAllProducts, createProduct, updateProduct, deleteProduct,
    getVariants, createVariant, updateVariant, deleteVariant,
    getBrands, createBrand, updateBrand, deleteBrand,
    getCategories, createCategory, deleteCategory,
    getOrders, getOrderDetails, updateOrderStatus
};

export default adminApi;