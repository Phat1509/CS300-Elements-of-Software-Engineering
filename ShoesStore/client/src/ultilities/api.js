const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

async function fetchAll() {
    console.debug(`[api] BASE=${BASE} - fetching products, variants, brands, categories`);
    try {
        const [prodRes, varRes, brandRes, catRes] = await Promise.all([
            fetch(`${BASE}/products`),
            fetch(`${BASE}/product_variants`),
            fetch(`${BASE}/brands`),
            fetch(`${BASE}/categories`),
        ]);

        // log http statuses for quick debugging
        console.debug('[api] statuses', {
            products: prodRes.status,
            product_variants: varRes.status,
            brands: brandRes.status,
            categories: catRes.status,
        });

        const safeJson = async (res) => {
            if (res.ok) return res.json();
            // not OK - try to read text for debugging and return empty array
            let txt;
            try { txt = await res.text(); } catch (e) { txt = '<no body>'; }
            console.warn(`[api] non-JSON response from ${res.url}: ${res.status} ${txt}`);
            return [];
        };

        const [products, variants, brands, categories] = await Promise.all([
            safeJson(prodRes),
            safeJson(varRes),
            safeJson(brandRes),
            safeJson(catRes),
        ]);

        const variantsByProduct = {};
        for (const v of variants) {
            variantsByProduct[v.product_id] = variantsByProduct[v.product_id] || [];
            variantsByProduct[v.product_id].push(v);
        }

        const brandsMap = Object.fromEntries((brands || []).map(b => [b.brand_id, b]));
        const catsMap = Object.fromEntries((categories || []).map(c => [c.category_id, c]));

        const mapped = (products || []).map(p => {
            const vs = variantsByProduct[p.product_id] || [];
            const colors = Array.from(new Set(vs.map(v => v.color).filter(Boolean)));
            const sizes = Array.from(new Set(vs.map(v => v.size).filter(Boolean)));
            const stock = vs.reduce((s, v) => s + (v.stock || 0), 0);
            const discount = p.discount_percentage || 0;
            const price = p.price;
            const originalPrice = discount > 0 ? Number((price / (1 - discount / 100)).toFixed(2)) : price;
            // derive gender from parent category name, fallback to category name,
            // and finally try to infer from product slug/name when categories are missing
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

            // deterministic-ish rating & reviews for UI
            const rating = Number(((p.product_id % 20 + 30) / 10).toFixed(1));
            const reviews = (p.product_id * 7) % 500;

            return {
                id: p.product_id,
                product_id: p.product_id,
                name: p.name,
                brand: brandsMap[p.brand_id]?.name || null,
                price,
                originalPrice,
                discountPercent: discount,
                isNew: false,
                isHot: discount >= 20,
                isActive: !!p.is_active,
                stock,
                image: p.image_url || null,
                images: p.image_url ? [p.image_url] : [],
                rating,
                reviews,
                category: cat ? cat.name : null,
                gender,
                colors,
                sizes,
                description: p.description || null,
                raw: p,
            };
        });
        return { products: mapped, variants, brands, categories };
    } catch (err) {
        console.error('[api] fetchAll error', err);
        // rethrow so callers can handle
        throw err;
    }
}

export async function getProducts() {
    const { products } = await fetchAll();
    return products;
}

export async function getProductById(id) {
    const { products } = await fetchAll();
    return products.find(p => String(p.id) === String(id));
}

export default { getProducts, getProductById };
