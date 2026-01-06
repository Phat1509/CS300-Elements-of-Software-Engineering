// client/src/components/user/WomenPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getProducts } from "../../utilities/api";

export default function WomenPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Thêm loading
  const [maxPrice, setMaxPrice] = useState(4000000);
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const all = await getProducts();

        const womenProducts = all.filter((p) => {
          const catId = Number(p.category_id);
          const parentId = p.category ? Number(p.category.parent_id) : null;

          return (catId === 2 || parentId === 2) && p.is_active;
        });

        setProducts(womenProducts);
      } catch (err) {
        console.error("Lỗi fetch women:", err);
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
        <p>Đang tải bộ sưu tập...</p>
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
          <span>Women</span>
        </div>
      </section>

      {/* Header */}
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Women&apos;s Collection</h1>
          <p className="men-sub">
            Khám phá vẻ đẹp thanh lịch và sự thoải mái cho phái nữ.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container men-content">
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
                <option value="price-low">Giá: Thấp đến cao</option>
                <option value="price-high">Giá: Cao đến thấp</option>
              </select>
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div
              style={{ padding: "40px", textAlign: "center", width: "100%" }}
            >
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Vui lòng thử khoảng giá khác.</p>
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
