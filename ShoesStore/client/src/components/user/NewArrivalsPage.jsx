// client/src/components/user/NewArrivalsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard"; 
import { getProducts } from "../../utilities/api";

export default function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10_000_000);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await getProducts();
        
        console.log("Data received:", data);

        if (data && data.length > 0) {
          setProducts(data);
        } else {
            console.warn("API returned empty or error");
        }
      } catch (err) {
        console.error("Error calling API in NewArrivals:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const displayed = useMemo(() => {
    return products.filter((p) => {
      const matchPrice = p.price >= minPrice && p.price <= maxPrice;
      const matchStatus = p.is_active === true;

      return matchPrice && matchStatus;
    });
  }, [products, minPrice, maxPrice]);

  const sortedDisplayed = useMemo(() => {
    const arr = [...displayed];
    switch (sortBy) {
      case "price-low":
        return arr.sort((a, b) => a.price - b.price);
      case "price-high":
        return arr.sort((a, b) => b.price - a.price);
      default:
        return arr.sort((a, b) => b.id - a.id);
    }
  }, [displayed, sortBy]);

  if (loading) {
    return (
      <div className="container" style={{ padding: "80px", textAlign: "center" }}>
        <h3>Loading products...</h3>
      </div>
    );
  }

  return (
    <div className="na">
       <section className="na-bc">
        <div className="container na-bc-in">
          <Link to="/" className="na-bc-link">Home</Link>
          <ChevronRight className="na-bc-sep" size={16} />
          <span>New Arrivals</span>
        </div>
      </section>

      <section className="na-head">
        <div className="container">
          <h1 className="na-title">New Arrivals</h1>
          <p className="na-sub">Discover our latest collection.</p>
        </div>
      </section>

      <section className="na-wrap">
        <div className="container na-grid">
           <aside className={`na-side ${showFilters ? "open" : ""}`}>
             <div className="na-card">
               <div className="na-card-top">
                 <h3>Filters</h3>
                 <button className="link-btn" onClick={() => { setMinPrice(0); setMaxPrice(10_000_000); }}>Clear All</button>
               </div>
               <div className="na-block">
                 <h4>Price Range</h4>
                 <input type="range" className="range-input" min="0" max="10000000" step="100000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ width: "100%", marginBottom: "12px" }} />
                 <div className="na-range">
                   <span>{minPrice.toLocaleString()} ₫</span>
                   <span>{maxPrice.toLocaleString()} ₫</span>
                 </div>
               </div>
             </div>
              <button className="btn btn-outline lg-hidden" style={{ marginTop: 16, width: "100%" }} onClick={() => setShowFilters(false)}>Close Filters</button>
           </aside>

          <main className="na-main">
            <div className="na-toolbar">
              <button className="btn btn-outline lg-hidden" onClick={() => setShowFilters((s) => !s)}>
                <SlidersHorizontal size={16} /> Filter
              </button>
              <p className="muted">Showing <strong>{sortedDisplayed.length}</strong> products</p>
              
              <div className="na-sort">
                <span className="muted">Sort by:</span>
                <select className="input" style={{ width: "auto", padding: "8px" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {sortedDisplayed.length > 0 ? (
              <div className="na-products">
                {sortedDisplayed.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                No products found.
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}