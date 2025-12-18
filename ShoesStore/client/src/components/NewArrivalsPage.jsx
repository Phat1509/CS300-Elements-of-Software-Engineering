import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { SlidersHorizontal } from "lucide-react";
import ProductCard from "./ProductCard.jsx";
export default function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://localhost:5000/products?isHot=true");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const displayed = products.filter(
    (p) => p.price >= minPrice && p.price <= maxPrice
  );

  const sortedDisplayed = React.useMemo(() => {
    const arr = [...displayed];
    switch (sortBy) {
      case "price-low":
        return arr.sort((a, b) => a.price - b.price);
      case "price-high":
        return arr.sort((a, b) => b.price - a.price);
      case "popular":
        return arr.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      case "rating":
        return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return arr.sort((a, b) => b.id - a.id);
    }
  }, [displayed, sortBy]);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="na">
      {/* Breadcrumb */}
      <section className="na-bc">
        <div className="container na-bc-in">
          <a href="/" className="na-bc-link">
            Home
          </a>
          <ChevronRight className="na-bc-sep" size={16} />
          <span>New Arrivals</span>
        </div>
      </section>

      <section className="na-head">
        <div className="container">
          <h1 className="na-title">New Arrivals</h1>
          <p className="na-sub">
            Discover our latest collection of premium footwear.
          </p>
        </div>
      </section>

      <section className="na-wrap">
        <div className="container na-grid">
          <aside className={`na-side ${showFilters ? "open" : ""}`}>
            <div className="na-card">
              <div className="na-card-top">
                <h3>Filters</h3>
                <button
                  className="link-btn"
                  onClick={() => {
                    setMinPrice(0);
                    setMaxPrice(200);
                  }}
                >
                  Clear All
                </button>
              </div>

              <div className="na-block">
                <h4>Price Range</h4>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                />
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
                <div className="na-range">
                  <span>${minPrice}</span>
                  <span>${maxPrice}</span>
                </div>
              </div>
            </div>
          </aside>

          <main className="na-main">
            <div className="na-toolbar">
              <button
                className="btn btn-outline lg-hidden"
                onClick={() => setShowFilters((s) => !s)}
              >
                <SlidersHorizontal size={16} /> Filters
              </button>

              <p className="muted">Showing {displayed.length} products</p>

              <div className="na-sort">
                <span className="muted">Sort by:</span>
                <select
                  className="input"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            <div className="na-products">
              {sortedDisplayed.map((p) => (
                <div key={p.id} className="na-card-wrap">
                  <ProductCard
                    {...p}
                    extra={
                      p.discountPercent
                        ? `-${p.discountPercent}%`
                        : p.isNew
                        ? "New"
                        : undefined
                    }
                  />
                </div>
              ))}
            </div>

            <div className="center">
              <button className="btn btn-outline btn-lg">
                Load More Products
              </button>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
