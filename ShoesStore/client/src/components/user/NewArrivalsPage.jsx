import React, { useEffect, useState, useMemo } from "react";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getProducts, getCategories, getBrands } from "../../utilities/api";

export default function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // --- FILTER STATES ---
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10_000_000);
  const [sortBy, setSortBy] = useState("newest");

  // State để lưu ID đang chọn
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // --- LOAD DATA ---
  useEffect(() => {
    async function initPage() {
      try {
        setLoading(true);
        // Gọi đồng thời cả 3 API
        const [pData, cData, bData] = await Promise.all([
          getProducts(),
          getCategories(),
          getBrands(),
        ]);

        setProducts(pData || []);
        setCategories(cData || []);
        setBrands(bData || []);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    }
    initPage();
  }, []);

  // --- LOGIC LỌC (CLIENT-SIDE) ---
  const displayed = useMemo(() => {
    return products.filter((p) => {
      // 1. Lọc giá
      const matchPrice = p.price >= minPrice && p.price <= maxPrice;
      // 2. Lọc trạng thái
      const matchStatus = p.is_active === true;
      // 3. Lọc danh mục (Nếu không chọn => true, nếu chọn => so sánh ID)
      const matchCat = selectedCategory
        ? Number(p.category_id) === Number(selectedCategory)
        : true;
      // 4. Lọc thương hiệu
      const matchBrand = selectedBrand
        ? Number(p.brand_id) === Number(selectedBrand)
        : true;

      return matchPrice && matchStatus && matchCat && matchBrand;
    });
  }, [products, minPrice, maxPrice, selectedCategory, selectedBrand]);

  // --- LOGIC SẮP XẾP ---
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
      <div
        className="container"
        style={{ padding: "80px", textAlign: "center" }}
      >
        <h3>Loading products...</h3>
      </div>
    );
  }

  return (
    <div className="na">
      <section className="na-bc">
        <div className="container na-bc-in">
          <Link to="/" className="na-bc-link">
            Home
          </Link>
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
                <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>Bộ lọc</h3>
                <button
                  className="link-btn"
                  onClick={() => {
                    setMinPrice(0);
                    setMaxPrice(10_000_000);
                    setSelectedCategory(null);
                    setSelectedBrand(null);
                  }}
                  style={{ color: "#ef4444", fontSize: "13px" }}
                >
                  Xóa tất cả
                </button>
              </div>

              <div className="na-block" style={{ marginTop: "20px" }}>
                <h4
                  style={{
                    marginBottom: "12px",
                    fontSize: "15px",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "5px",
                  }}
                >
                  Danh mục
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === null}
                      onChange={() => setSelectedCategory(null)}
                    />
                    <span style={{ fontSize: "14px" }}>Tất cả danh mục</span>
                  </label>
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.id}
                        onChange={() => setSelectedCategory(cat.id)}
                      />
                      <span style={{ fontSize: "14px" }}>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="na-block" style={{ marginTop: "24px" }}>
                <h4
                  style={{
                    marginBottom: "12px",
                    fontSize: "15px",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "5px",
                  }}
                >
                  Thương hiệu
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="brand"
                      checked={selectedBrand === null}
                      onChange={() => setSelectedBrand(null)}
                    />
                    <span style={{ fontSize: "14px" }}>Tất cả thương hiệu</span>
                  </label>
                  {brands.map((brand) => (
                    <label
                      key={brand.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="brand"
                        checked={selectedBrand === brand.id}
                        onChange={() => setSelectedBrand(brand.id)}
                      />
                      <span style={{ fontSize: "14px" }}>{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* PHẦN LỌC GIÁ (GIỮ LẠI CỦA BẠN) */}
              <div className="na-block" style={{ marginTop: "24px" }}>
                <h4
                  style={{
                    marginBottom: "12px",
                    fontSize: "15px",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "5px",
                  }}
                >
                  Khoảng giá
                </h4>
                <input
                  type="range"
                  className="range-input"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: "100%", marginBottom: "12px" }}
                />
                <div
                  className="na-range"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  <span>{minPrice.toLocaleString()} ₫</span>
                  <span>{maxPrice.toLocaleString()} ₫</span>
                </div>
              </div>
            </div>

            <button
              className="btn btn-outline lg-hidden"
              style={{ marginTop: 16, width: "100%" }}
              onClick={() => setShowFilters(false)}
            >
              Đóng bộ lọc
            </button>
          </aside>

          {/* ============ MAIN GRID ============ */}
          <main className="na-main">
            <div className="na-toolbar">
              <button
                className="btn btn-outline lg-hidden"
                onClick={() => setShowFilters((s) => !s)}
              >
                <SlidersHorizontal size={16} /> Filter
              </button>
              <p className="muted">
                Showing <strong>{sortedDisplayed.length}</strong> products
              </p>

              <div className="na-sort">
                <span className="muted">Sort by:</span>
                <select
                  className="input"
                  style={{ width: "auto", padding: "8px" }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Grid Sản Phẩm */}
            {sortedDisplayed.length > 0 ? (
              <div className="na-products">
                {sortedDisplayed.map((p) => (
                  // Truyền props đã được chuẩn hóa (mapProduct) vào ProductCard
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            ) : (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                No products found.
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
