const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

// simple cache for brands/categories to avoid fetching them repeatedly
let _brandsCache = null;
let _categoriesCache = null;

async function safeJson(res) {
    if (!res) return null;
    try {
        if (res.ok) return await res.json();
        const txt = await res.text().catch(() => '<no body>');
        console.warn(`[api] non-OK response ${res.status} ${res.url}: ${txt}`);
        return null;
    } catch (err) {
        console.warn('[api] safeJson error', err);
        return null;
    }
}

async function get(path) {
    const url = `${BASE}${path}`;
    const res = await fetch(url);
    return safeJson(res);
}

// write helpers (POST/PATCH/DELETE) intentionally omitted — admin/backend should perform writes

export async function getBrands(force = false) {
    if (!force && _brandsCache) return _brandsCache;
    const data = await get('/brands') || [];
    _brandsCache = data;
    return data;
}

export async function getCategories(force = false) {
    if (!force && _categoriesCache) return _categoriesCache;
    const data = await get('/categories') || [];
    _categoriesCache = data;
    return data;
}

export async function getVariantsByProductId(productId) {
    if (!productId) return [];
    // json-server supports query like /product_variants?product_id=123
    const data = await get(`/product_variants?product_id=${encodeURIComponent(productId)}`) || [];
    return data;
}

// admin-only write helpers removed — order creation and stock changes must be performed by backend/admin UI

function deriveProductShape(raw, variants = [], brands = [], categories = []) {
    if (!raw) return null;
    const colors = Array.from(new Set((variants || []).map(v => v.color).filter(Boolean)));
    const sizes = Array.from(new Set((variants || []).map(v => v.size).filter(Boolean)));
    const stock = (variants || []).reduce((s, v) => s + (Number(v.stock) || 0), 0);
    const discount = raw.discount_percentage || 0;
    const price = raw.price;
    const originalPrice = discount > 0 ? Number((price / (1 - discount / 100)).toFixed(2)) : price;

    const brandsMap = Object.fromEntries((brands || []).map(b => [b.brand_id, b]));
    const catsMap = Object.fromEntries((categories || []).map(c => [c.category_id, c]));
    const cat = catsMap[raw.category_id];
    const parent = cat && cat.parent_id ? catsMap[cat.parent_id] : null;
    let gender = 'unisex';
    if (parent && parent.name) gender = String(parent.name).toLowerCase();
    else if (cat && cat.name) gender = String(cat.name).toLowerCase();
    else {
        const probe = String((raw.slug || raw.name || '')).toLowerCase();
        if (probe.includes('men') || probe.includes("men's") || probe.includes('male')) gender = 'men';
        else if (probe.includes('women') || probe.includes("women's") || probe.includes('female') || probe.includes('ladies')) gender = 'women';
        else if (probe.includes('kid') || probe.includes('children') || probe.includes('boys') || probe.includes('girls')) gender = 'kids';
    }

    const rating = Number(((raw.product_id % 20 + 30) / 10).toFixed(1));
    const reviews = (raw.product_id * 7) % 500;

    return {
        id: raw.product_id,
        product_id: raw.product_id,
        name: raw.name,
        brand: brandsMap[raw.brand_id]?.name || null,
        price,
        originalPrice,
        discountPercent: discount,
        isNew: false,
        isHot: discount >= 20,
        isActive: !!raw.is_active,
        stock,
        image: raw.image_url || null,
        images: raw.image_url ? [raw.image_url] : [],
        rating,
        reviews,
        category: cat ? cat.name : null,
        gender,
        colors,
        sizes,
        description: raw.description || null,
        raw,
    };
}

export async function getProducts({ q, limit, offset } = {}) {
    // basic support for query/pagination that json-server understands
    let path = '/products';
    const params = [];
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (limit) params.push(`_limit=${encodeURIComponent(limit)}`);
    if (typeof offset !== 'undefined') params.push(`_start=${encodeURIComponent(offset)}`);
    if (params.length) path += `?${params.join('&')}`;

    const products = await get(path) || [];
    // to avoid many extra requests, we can fetch brands/categories once
    const [brands, categories] = await Promise.all([getBrands(), getCategories()]);
    // for the products list we will not fetch variants for every product (expensive),
    // so map minimally (variants/colors/sizes/stock remain empty unless caller uses variants endpoint)
    const catsMap = Object.fromEntries((categories || []).map(c => [c.category_id, c]));
    return (products || []).map(p => {
        const cat = catsMap[p.category_id];
        const parent = cat && cat.parent_id ? catsMap[cat.parent_id] : null;
        let gender = 'unisex';
        if (parent && parent.name) gender = String(parent.name).toLowerCase();
        else if (cat && cat.name) gender = String(cat.name).toLowerCase();
        else {
            const probe = String((p.slug || p.name || '')).toLowerCase();
            if (probe.includes('men') || probe.includes("men's") || probe.includes('male')) gender = 'men';
            else if (probe.includes('women') || probe.includes("women's") || probe.includes('female') || probe.includes('ladies')) gender = 'women';
            else if (probe.includes('kid') || probe.includes('children') || probe.includes('boys') || probe.includes('girls')) gender = 'kids';
        }

        return {
            id: p.product_id,
            product_id: p.product_id,
            name: p.name,
            brand: (brands || []).find(b => b.brand_id === p.brand_id)?.name || null,
            price: p.price,
            originalPrice: p.price,
            discountPercent: p.discount_percentage || 0,
            isNew: false,
            isHot: (p.discount_percentage || 0) >= 20,
            isActive: !!p.is_active,
            stock: 0,
            image: p.image_url || null,
            images: p.image_url ? [p.image_url] : [],
            rating: Number(((p.product_id % 20 + 30) / 10).toFixed(1)),
            reviews: (p.product_id * 7) % 500,
            category: (categories || []).find(c => c.category_id === p.category_id)?.name || null,
            gender,
            colors: [],
            sizes: [],
            description: p.description || null,
            raw: p,
        };
    });
}

export async function getProductById(id) {
    if (!id) return null;
    const raw = await get(`/products?product_id=${encodeURIComponent(id)}`);
    // json-server returns array for query, try direct fetch if available
    const product = Array.isArray(raw) ? raw[0] : raw;
    if (!product) return null;
    const [variants, brands, categories] = await Promise.all([
        getVariantsByProductId(product.product_id),
        getBrands(),
        getCategories(),
    ]);
    return deriveProductShape(product, variants, brands, categories);
}

export default { getProducts, getProductById, getBrands, getCategories, getVariantsByProductId };
