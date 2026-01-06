// client/src/components/user/KidsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getProducts } from "../../utilities/api";

export default function KidsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState(4000000);
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const all = await getProducts();

        const kidsProducts = all.filter((p) => {
          const catId = Number(p.category_id);
          const parentId = p.category ? Number(p.category.parent_id) : null;

          // Lấy nếu là Kids (3) hoặc con của Kids (parent_id = 3)
          return (catId === 3 || parentId === 3) && p.is_active;
        });

        setProducts(kidsProducts);
      } catch (err) {
        console.error("Lỗi fetch Kids:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = useMemo(
    () => products.filter((p) => p.price <= maxPrice),
    [products, maxPrice]
  );

  // Sort products
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

  // Loading UI
  if (loading) {
    return (
      <main
        className="men-wrap"
        style={{ minHeight: "60vh", paddingTop: 100, textAlign: "center" }}
      >
        <p>Đang tải sản phẩm cho bé...</p>
      </main>
    );
  }

  return (
    <main className="men-wrap">
      {/* Breadcrumb */}
      <section className="men-bc">
        <div className="container">
          <Link to="/" className="men-bc-link">
            Home
          </Link>
          <span className="men-bc-sep">›</span>
          <span>Kids</span>
        </div>
      </section>

      {/* Header */}
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Kids&apos; Collection</h1>
          <p className="men-sub">
            Thoải mái vui chơi, vận động với bộ sưu tập giày bền bỉ dành cho trẻ
            em.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container men-content">
        {/* Sidebar */}
        <aside className="men-side">
          <div className="men-card">
            <div className="men-card-top">
              <h3>Filters</h3>
              <button
                className="link-btn"
                type="button"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>

            {/* Price Filter (VND) */}
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

        {/* Main */}
        <div className="men-main">
          <div className="men-toolbar">
            <p className="muted">Showing {sortedProducts.length} products</p>
            <div className="men-sort">
              <span className="muted">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Phổ biến</option>
                <option value="newest">Mới nhất</option>
                <option value="price-low">Giá thấp đến cao</option>
                <option value="price-high">Giá cao đến thấp</option>
              </select>
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div
              style={{ padding: "40px", textAlign: "center", width: "100%" }}
            >
              <h3>Chưa có sản phẩm nào</h3>
              <p>Vui lòng quay lại sau.</p>
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
