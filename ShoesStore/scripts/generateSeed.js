const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

function slugify(s) {
    return s
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

const OUT_CLIENT = path.join(__dirname, '..', 'client', 'db.json');
const OUT_SERVER = path.join(__dirname, '..', 'server', 'seeds', 'generated_seed.json');

function makeBrands() {
    const names = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Converse'];
    return names.map((name, i) => ({ brand_id: i + 1, name, description: faker.lorem.sentences(2) }));
}

function makeCategories() {
    const top = [
        { id: 1, name: 'Men', slug: 'men' },
        { id: 2, name: 'Women', slug: 'women' },
        { id: 3, name: 'Kids', slug: 'kids' },
    ];

    const subs = [];
    const subNames = ['Running', 'Sneakers', 'Casual', 'Heels', 'Street', 'Training', 'Outdoor'];
    let id = 4;
    for (const t of top) {
        for (let i = 0; i < 3; i++) {
            const name = subNames[(i + t.id) % subNames.length];
            subs.push({ category_id: id, name, slug: `${slugify(name)}-${t.slug}`, parent_id: t.id });
            id++;
        }
    }
    return top.map(t => ({ category_id: t.id, name: t.name, slug: t.slug, description: null, parent_id: null })).concat(subs);
}

function makeProducts(brands, categories, count = 60) {
    const products = [];
    let pid = 1000;
    for (let i = 0; i < count; i++) {
        const brand = faker.helpers.arrayElement(brands);
        // pick only subcategories (parent_id != null) for specific products
        const subCats = categories.filter(c => c.parent_id);
        const category = faker.helpers.arrayElement(subCats);
        const name = `${brand.name} ${faker.commerce.productAdjective()} ${faker.word.noun()}`;
        const price = Number((faker.number.float({ min: 20, max: 200, precision: 0.01 })).toFixed(2));
        const discount = faker.number.int({ min: 0, max: 30 });
        const image_url = `https://picsum.photos/seed/product-${pid}/800/600`;
        products.push({
            product_id: pid,
            brand_id: brand.brand_id,
            category_id: category.category_id,
            name,
            slug: slugify(name) + '-' + pid,
            description: faker.lorem.paragraph(),
            price,
            image_url,
            created_at: new Date().toISOString(),
            discount_percentage: discount,
            is_active: true,
        });
        pid++;
    }
    return products;
}

function makeVariants(products) {
    const variants = [];
    let vid = 5000;
    for (const p of products) {
        const colors = faker.helpers.arrayElements(['Black', 'White', 'Red', 'Blue', 'Green', 'Pink', 'Grey'], faker.number.int({ min: 1, max: 3 }));
        const sizes = faker.helpers.arrayElements(['36', '37', '38', '39', '40', '41', '42', '43', '44', '28', '29', '30', '31', '32'], faker.number.int({ min: 2, max: 5 }));
        for (const color of colors) {
            for (const size of sizes) {
                const stock = faker.number.int({ min: 0, max: 50 });
                variants.push({
                    variant_id: vid,
                    product_id: p.product_id,
                    color,
                    size,
                    stock,
                    sku: `SKU-${p.product_id}-${vid}`,
                });
                vid++;
            }
        }
    }
    return variants;
}

function toClientProducts(products, variants, brands, categories) {
    // Map product -> client shape
    const catById = Object.fromEntries(categories.map(c => [c.category_id, c]));
    const brandById = Object.fromEntries(brands.map(b => [b.brand_id, b]));
    const variantsByProduct = {};
    for (const v of variants) variantsByProduct[v.product_id] = (variantsByProduct[v.product_id] || []).concat(v);

    return products.map(p => {
        const v = variantsByProduct[p.product_id] || [];
        const colors = Array.from(new Set(v.map(x => x.color).filter(Boolean)));
        const sizes = Array.from(new Set(v.map(x => x.size).filter(Boolean)));
        const stock = v.reduce((s, x) => s + (x.stock || 0), 0);
        const brand = brandById[p.brand_id]?.name || 'Unknown';
        const category = catById[p.category_id]?.name || 'General';
        const isNew = faker.datatype.boolean();
        const isHot = faker.datatype.boolean();
        const discount = p.discount_percentage || 0;
        const price = p.price;
        const originalPrice = discount > 0 ? Number((price / (1 - discount / 100)).toFixed(2)) : price;
        return {
            id: p.product_id,
            name: p.name,
            brand,
            price: price,
            originalPrice,
            discountPercent: discount,
            isNew,
            isHot,
            isActive: p.is_active,
            stock,
            image: p.image_url,
            images: [p.image_url],
            rating: Number((faker.number.int({ min: 35, max: 50 }) / 10).toFixed(1)),
            reviews: faker.number.int({ min: 0, max: 500 }),
            category,
            gender: (() => {
                const parent = categories.find(c => c.category_id === catById[p.category_id]?.parent_id);
                return parent ? parent.name.toLowerCase() : 'unisex';
            })(),
            colors,
            sizes,
            description: p.description,
        };
    });
}

async function main() {
    const brands = makeBrands();
    const categories = makeCategories();
    const products = makeProducts(brands, categories, 80);
    const variants = makeVariants(products);

    // client format
    const clientProducts = toClientProducts(products, variants, brands, categories);

    // write client db.json (overwrite products array)
    const clientData = { products: clientProducts };
    fs.mkdirSync(path.dirname(OUT_CLIENT), { recursive: true });
    fs.writeFileSync(OUT_CLIENT, JSON.stringify(clientData, null, 2), 'utf8');

    // write server seed JSON (optional)
    const serverData = { brands, categories, products, product_variants: variants };
    fs.mkdirSync(path.dirname(OUT_SERVER), { recursive: true });
    fs.writeFileSync(OUT_SERVER, JSON.stringify(serverData, null, 2), 'utf8');

    console.log('Generated:');
    console.log(` - ${clientProducts.length} products -> ${OUT_CLIENT}`);
    console.log(` - server seed -> ${OUT_SERVER}`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
