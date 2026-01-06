// client/src/ultilities/adminApi.js

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

export async function getOrders() {
    return request('/orders?_sort=created_at&_order=desc') || [];
}

export async function updateOrderStatus(orderId, status) {
    return request(`/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
}

export async function getOrderItems(orderId) {
    return request(`/order_item?order_id=${orderId}`) || [];
}

export async function getAllProducts() {
    return request('/products'); 
}

export default { createProduct, updateProduct,getAllProducts,  deleteProduct, getOrders, updateOrderStatus, getOrderItems };