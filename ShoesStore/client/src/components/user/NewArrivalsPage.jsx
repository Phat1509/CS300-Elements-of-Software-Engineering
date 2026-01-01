import React, { useEffect, useState, useMemo } from "react";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import ProductCard from "./ProductCard";
import { getProducts } from "../../ultilities/api";

export default function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // PRICE RANGE (VND)
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5_000_000);

  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await getProducts();
        console.log("PRODUCTS:", res.data);
        // KHÔNG filter is_active khi mock
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  /* ================= FILTER ================= */
  const displayed = useMemo(() => {
    return products.filter(
      (p) => p.price >= minPrice && p.price <= maxPrice
    );
  }, [products, minPrice, maxPrice]);

  /* ================= SORT ================= */
  const sortedDisplayed = useMemo(() => {
    const arr = [...displayed];
    switch (sortBy) {
      case "price-low":
        return arr.sort((a, b) => a.price - b.price);
      case "price-high":
        return arr.sort((a, b) => b.price - a.price);
      default:
        // newest (mock): product_id lớn hơn = mới hơn
        return arr.sort((a, b) => b.product_id - a.product_id);
    }
  }, [displayed, sortBy]);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="na">
      {/* ================= BREADCRUMB ================= */}
      <section className="na-bc">
        <div className="container na-bc-in">
          <a href="/" className="na-bc-link">Home</a>
          <ChevronRight className="na-bc-sep" size={16} />
          <span>New Arrivals</span>
        </div>
      </section>

      {/* ================= HEADER ================= */}
      <section className="na-head">
        <div className="container">
          <h1 className="na-title">New Arrivals</h1>
          <p className="na-sub">
            Discover our latest collection of premium footwear.
          </p>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="na-wrap">
        <div className="container na-grid">
          {/* ============ FILTER SIDEBAR ============ */}
          <aside className={`na-side ${showFilters ? "open" : ""}`}>
            <div className="na-card">
              <div className="na-card-top">
                <h3>Filters</h3>
                <button
                  className="link-btn"
                  onClick={() => {
                    setMinPrice(0);
                    setMaxPrice(5_000_000);
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
                  max="5000000"
                  step="50000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                />

                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="50000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />

                <div className="na-range">
                  <span>{minPrice.toLocaleString()} ₫</span>
                  <span>{maxPrice.toLocaleString()} ₫</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ============ MAIN ============ */}
          <main className="na-main">
            <div className="na-toolbar">
              <button
                className="btn btn-outline lg-hidden"
                onClick={() => setShowFilters((s) => !s)}
              >
                <SlidersHorizontal size={16} /> Filters
              </button>

              <p className="muted">
                Showing {sortedDisplayed.length} products
              </p>

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
                </select>
              </div>
            </div>

            <div className="na-products">
              {sortedDisplayed.map((p) => (
                <div key={p.product_id} className="na-card-wrap">
                  <ProductCard
                    {...p}
                    extra={
                      p.discount_percentage
                        ? `-${p.discount_percentage}%`
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
