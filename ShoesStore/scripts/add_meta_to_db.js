const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'client', 'db.json');
if (!fs.existsSync(dbPath)) {
    console.error('client/db.json not found');
    process.exit(1);
}

const raw = fs.readFileSync(dbPath, 'utf8');
let db;
try { db = JSON.parse(raw); } catch (e) { console.error('Failed to parse db.json', e); process.exit(1); }

const products = db.products || [];
// collect unique brand_ids and category_ids
const brandIds = Array.from(new Set(products.map(p => p.brand_id).filter(Boolean)));
const categoryIds = Array.from(new Set(products.map(p => p.category_id).filter(Boolean)));

const brands = brandIds.map(id => ({ brand_id: id, name: `Brand ${id}`, description: null }));

// create parent categories for men/women/kids and assign child categories round-robin
const parentMap = [{ category_id: 100, name: 'Men', parent_id: null }, { category_id: 101, name: 'Women', parent_id: null }, { category_id: 102, name: 'Kids', parent_id: null }];

const categories = [];
categoryIds.forEach((cid, idx) => {
    const parent = parentMap[idx % parentMap.length];
    categories.push({ category_id: cid, name: `Category ${cid}`, description: null, parent_id: parent.category_id, slug: `category-${cid}` });
});

// merge into db and write
db.brands = db.brands || brands;
db.categories = db.categories || [...parentMap, ...categories];

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Wrote brands and categories into client/db.json:', db.brands.length, 'brands,', db.categories.length, 'categories');
