// client/src/ultilities/adminApi.js

// 
const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001'; 

async function safeJson(res) {
    if (!res) return null;
    try {
        if (res.ok) return await res.json();
        const txt = await res.text().catch(() => '<no body>');
        console.warn(`[adminApi] non-OK ${res.status} ${res.url}: ${txt}`);
        return null;
    } catch (e) { console.warn('[adminApi] safeJson', e); return null; }
}

async function request(path, opts = {}) {
    const res = await fetch(`${BASE}${path}`, opts);
    return safeJson(res);
}

// --- PRODUCTS ---
export async function createProduct(payload) {
    return request('/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function updateProduct(id, payload) {
    return request(`/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function deleteProduct(id) {
    return request(`/products/${id}`, { method: 'DELETE' });
}

// --- ORDERS (ADMIN) ---

// Lấy tất cả orders (kèm thông tin user nếu json-server hỗ trợ _expand)
export async function getOrders() {
    // _sort=created_at&_order=desc: Mới nhất lên đầu
    return request('/orders?_sort=created_at&_order=desc') || [];
}

// Cập nhật trạng thái đơn hàng (VD: Pending -> Shipped)
export async function updateOrderStatus(orderId, status) {
    return request(`/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
}

// Lấy chi tiết item của đơn hàng (để Admin xem khách mua gì)
export async function getOrderItems(orderId) {
    return request(`/order_item?order_id=${orderId}`) || [];
}

export default { createProduct, updateProduct, deleteProduct, getOrders, updateOrderStatus, getOrderItems };