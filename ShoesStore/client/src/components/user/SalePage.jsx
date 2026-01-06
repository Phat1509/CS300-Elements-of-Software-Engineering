import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getProducts } from "../../utilities/api";

export default function SalePage() {
  const [products, setProducts] = useState([]);
  const [maxPrice, setMaxPrice] = useState(4000000);
  const [sortBy, setSortBy] = useState("discount");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const all = await getProducts();

        // Lọc những sản phẩm có discount_percentage > 0
        const saleItems = all.filter(
          (p) => p.is_active && (p.discount_percentage || 0) > 0
        );

        setProducts(saleItems);
      } catch (err) {
        console.error("Error fetching sale products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) => typeof p.price === "number" && p.price <= maxPrice
      ),
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
      case "discount":
      default:
        // Sắp xếp giảm giá nhiều nhất lên đầu
        return arr.sort(
          (a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0)
        );
    }
  }, [filteredProducts, sortBy]);

  const handleClearAll = () => setMaxPrice(4000000);

  if (loading) {
    return (
      <main className="men-wrap" style={{ minHeight: "60vh", paddingTop: 100, textAlign: "center" }}>
        <p>Đang tìm kiếm các ưu đãi tốt nhất...</p>
      </main>
    );
  }

  return (
    <main className="men-wrap">
      {/* Breadcrumb */}
      <section className="men-bc">
        <div className="container">
          <Link to="/" className="men-bc-link">Home</Link>
          <span className="men-bc-sep">›</span>
          <span>Sale</span>
        </div>
      </section>

      {/* Header */}
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Sale Collection</h1>
          <p className="men-sub">
            Đừng bỏ lỡ những deal hời nhất! Săn ngay các mẫu giày cao cấp với mức giá ưu đãi.
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
              <button className="link-btn" type="button" onClick={handleClearAll}>Clear All</button>
            </div>

            {/* Price Range (VND) */}
            <div className="men-block">
              <h4>Mức giá</h4>
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
            <p className="muted">
              Tìm thấy {sortedProducts.length} sản phẩm giảm giá
            </p>
            <div className="men-sort">
              <span className="muted">Sắp xếp:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="discount">Giảm nhiều nhất</option>
                <option value="price-low">Giá: Thấp đến cao</option>
                <option value="price-high">Giá: Cao đến thấp</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", width: "100%" }}>
              <h3>Hiện chưa có sản phẩm giảm giá trong tầm giá này</h3>
              <p className="muted">
                 Có thể Database của bạn chưa set trường <b>discount_percentage</b> cho sản phẩm nào.
              </p>
            </div>
          ) : (
            <div className="men-grid">
              {sortedProducts.map((p) => (
                <ProductCard
                  key={p.product_id || p.id}
                  id={p.product_id || p.id}
                  // QUAN TRỌNG: Sửa p.image_url thành p.image để dùng ảnh placeholder nếu lỗi
                  image={p.image} 
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