import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "./ProductCard";
import { getProducts } from "../../ultilities/api";

export default function MenPage() {
  const [products, setProducts] = useState([]);
  const [maxPrice, setMaxPrice] = useState(4000000);
  const [sortBy, setSortBy] = useState("popular");

  // Fetch data from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const all = await getProducts();

        // category_id = 1 → Men
        const menProducts = all.filter(
          (p) => p.category_id === 1 && p.is_active
        );
        console.log(menProducts);
        setProducts(menProducts);
      } catch (err) {
        console.error("Error fetching men products:", err);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((p) => p.price <= maxPrice),
    [products, maxPrice]
  );

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case "price-low":
        return arr.sort((a, b) => a.price - b.price);
      case "price-high":
        return arr.sort((a, b) => b.price - a.price);
      case "newest":
        return arr.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      case "popular":
      default:
        return arr;
    }
  }, [filteredProducts, sortBy]);

  const handleClearAll = () => setMaxPrice(4000000);

  return (
    <main className="men-wrap">
      <section className="men-bc">
        <div className="container">
          <a href="/" className="men-bc-link">
            Home
          </a>
          <span className="men-bc-sep">›</span>
          <span>Men</span>
        </div>
      </section>

      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Men&apos;s Collection</h1>
          <p className="men-sub">
            Explore our curated selection of men's footwear.
          </p>
        </div>
      </section>

      <section className="container men-content">
        <aside className="men-side">
          <div className="men-card">
            <div className="men-card-top">
              <h3>Filters</h3>
              <button className="link-btn" onClick={handleClearAll}>
                Clear All
              </button>
            </div>

            <div className="men-block">
              <h4>Price Range</h4>
              <input
                type="range"
                min="0"
                max="4000000"
                step="100000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <div className="men-range">
                <span>0₫</span>
                <span>{maxPrice.toLocaleString()}₫</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="men-main">
          <div className="men-toolbar">
            <p className="muted">Showing {filteredProducts.length} products</p>
            <div className="men-sort">
              <span className="muted">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Default</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="men-grid">
            {sortedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                image={p.image_url}
                name={p.name}
                price={p.price}
                extra={
                  p.discount_percentage
                    ? `-${p.discount_percentage}%`
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
