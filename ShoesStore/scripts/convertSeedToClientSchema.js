const fs = require('fs');
const path = require('path');

const inPath = path.join(__dirname, '..', 'server', 'seeds', 'generated_seed.json');
const outPath = path.join(__dirname, '..', 'client', 'db.json');

if (!fs.existsSync(inPath)) {
    console.error('Input seed not found:', inPath);
    process.exit(1);
}

const seed = JSON.parse(fs.readFileSync(inPath, 'utf8'));

const products = (seed.products || []).map(p => ({
    product_id: p.product_id,
    brand_id: p.brand_id ?? null,
    category_id: p.category_id ?? null,
    name: p.name,
    slug: p.slug,
    description: p.description ?? null,
    price: p.price,
    image_url: p.image_url ?? null,
    created_at: p.created_at ?? null,
    discount_percentage: p.discount_percentage ?? null,
    is_active: p.is_active == null ? null : !!p.is_active,
}));

const product_variants = seed.product_variants || [];

const out = { products, product_variants };

fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log('Wrote client db:', outPath, 'products:', products.length, 'variants:', product_variants.length);
