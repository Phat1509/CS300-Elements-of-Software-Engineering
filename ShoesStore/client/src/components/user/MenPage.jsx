// client/src/components/user/MenPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getProducts } from "../../utilities/api";

export default function MenPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  const [maxPrice, setMaxPrice] = useState(4000000);
  const [sortBy, setSortBy] = useState("popular");

  // Fetch data
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getProducts();

        const menProducts = all.filter(
          (p) =>
            (Number(p.category_id) === 1 || Number(p.category_id) === 3) &&
            p.is_active
        );

        setProducts(menProducts);
      } catch (err) {
        console.error("Error fetching men products:", err);
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <main
        className="men-wrap"
        style={{ minHeight: "60vh", paddingTop: 100, textAlign: "center" }}
      >
        <p>Đang tải sản phẩm...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main
        className="men-wrap"
        style={{ minHeight: "60vh", paddingTop: 100, textAlign: "center" }}
      >
        <p style={{ color: "red" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-outline"
        >
          Thử lại
        </button>
      </main>
    );
  }

  return (
    <main className="men-wrap">
      <section className="men-bc">
        <div className="container">
          <Link to="/" className="men-bc-link">
            Home
          </Link>
          <span className="men-bc-sep">›</span>
          <span>Men</span>
        </div>
      </section>

      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Men&apos;s Collection</h1>
          <p className="men-sub">
            Khám phá bộ sưu tập giày nam mới nhất và chất lượng nhất.
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
            <p className="muted">Showing {sortedProducts.length} products</p>
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

          {sortedProducts.length === 0 ? (
            <div
              style={{ padding: "40px 0", textAlign: "center", width: "100%" }}
            >
              <h3>Không tìm thấy sản phẩm nào</h3>
              <p className="muted">Thử điều chỉnh bộ lọc giá xem sao nhé.</p>
            </div>
          ) : (
            <div className="men-grid">
              {sortedProducts.map((p) => (
                <ProductCard
                  key={p.product_id || p.id}
                  id={p.product_id || p.id}
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
          )}
        </div>
      </section>
    </main>
  );
}
