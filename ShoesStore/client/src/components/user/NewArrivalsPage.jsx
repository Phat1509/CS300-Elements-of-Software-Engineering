import React, { useEffect, useState, useMemo } from "react";
import { ChevronRight, SlidersHorizontal, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getProducts, getCategories, getBrands } from "../../utilities/api";

export default function ProductListingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // --- FILTER STATES ---
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // SỬA: Giá để theo Đô la (ví dụ tối đa 1000$)
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState("newest");
  const [onlySale, setOnlySale] = useState(false); // Thêm lọc Sale

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // --- LOAD DATA ---
  useEffect(() => {
    async function initPage() {
      try {
        setLoading(true);
        const [pData, cData, bData] = await Promise.all([
          getProducts(),
          getCategories(),
          getBrands(),
        ]);

        setProducts(pData || []);

        const uniqueCategories = Array.from(
          new Map((cData || []).map((c) => [c.id, c])).values()
        );
        setCategories(uniqueCategories);

        const uniqueBrands = Array.from(
          new Map((bData || []).map((b) => [b.id, b])).values()
        );
        setBrands(uniqueBrands);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    }
    initPage();
  }, []);

  /* ================= XỬ LÝ LỌC SẢN PHẨM ================= */
  const displayed = useMemo(() => {

    let validCategoryIds = [];
    
    if (selectedCategory) {
      const selectedId = Number(selectedCategory);
      validCategoryIds.push(selectedId); 
      
      const childIds = categories
        .filter(c => Number(c.parent_id) === selectedId)
        .map(c => Number(c.id));
        
      validCategoryIds = [...validCategoryIds, ...childIds];
    }

    return products.filter((p) => {
      const effectivePrice =
        p.discount_percentage > 0
          ? p.price * (1 - p.discount_percentage / 100)
          : p.price;
      const matchPrice =
        effectivePrice >= minPrice && effectivePrice <= maxPrice;

      const matchStatus = p.is_active === true;


      const matchCat = selectedCategory
        ? validCategoryIds.includes(Number(p.category_id))
        : true;

      const matchBrand = selectedBrand
        ? Number(p.brand_id) === Number(selectedBrand)
        : true;

      const isSale = p.discount_percentage > 0;
      const matchSale = onlySale ? isSale : true;

      return matchPrice && matchStatus && matchCat && matchBrand && matchSale;
    });
  }, [products, minPrice, maxPrice, selectedCategory, selectedBrand, onlySale, categories]); // Nhớ thêm categories vào dependency
  // --- LOGIC SẮP XẾP ---
  const sortedDisplayed = useMemo(() => {
    const arr = [...displayed];

    const getFinalPrice = (p) => {
      return p.discount_percentage > 0
        ? p.price * (1 - p.discount_percentage / 100)
        : p.price;
    };

    switch (sortBy) {
      case "price-low":
        return arr.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
      case "price-high":
        return arr.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
      default:
        return arr.sort((a, b) => b.id - a.id);
    }
  }, [displayed, sortBy]);

  if (loading)
    return (
      <div style={{ padding: "80px", textAlign: "center" }}>
        <h3>Loading...</h3>
      </div>
    );

  return (
    <div className="na" style={{ background: "#fff", minHeight: "100vh" }}>
      {/* 1. BREADCRUMB - Tinh gọn */}
      <nav
        className="na-bc"
        style={{
          background: "#f8fafc",
          padding: "12px 0",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          <Link to="/" style={{ color: "#64748b", textDecoration: "none" }}>
            Home
          </Link>
          <ChevronRight size={14} color="#94a3b8" />
          <span style={{ color: "#0f172a", fontWeight: "500" }}>Shop All</span>
        </div>
      </nav>

      {/* 2. HEADER SECTION */}
      <header
        className="na-head"
        style={{
          padding: "40px 0",
          textAlign: "center",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <div className="container">
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "800",
              color: "#0f172a",
              marginBottom: "8px",
            }}
          >
            Our Collection
          </h1>
          <p style={{ color: "#64748b", maxWidth: "600px", margin: "0 auto" }}>
            Discover our latest collection.
          </p>
        </div>
      </header>

      <section className="na-wrap" style={{ padding: "40px 0" }}>
        <div
          className="container na-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "40px",
          }}
        >
          {/* 3. SIDEBAR FILTER */}
          <aside
            className={`na-side ${showFilters ? "open" : ""}`}
            style={{ position: "sticky", top: "20px", height: "fit-content" }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}> Filter</h3>
                <button
                  onClick={() => {
                    setMinPrice(0);
                    setMaxPrice(1000); // Sửa về USD
                    setSelectedCategory(null);
                    setSelectedBrand(null);
                    setOnlySale(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#3b82f6",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  reset
                </button>
              </div>

              {/* Lọc Sale - Nổi bật */}
              <div
                style={{
                  marginBottom: "24px",
                  padding: "12px",
                  background: "#fff1f2",
                  borderRadius: "8px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    color: "#be123c",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={onlySale}
                    onChange={(e) => setOnlySale(e.target.checked)}
                    style={{
                      accentColor: "#be123c",
                      width: "16px",
                      height: "16px",
                    }}
                  />
                  Sale up %
                </label>
              </div>

              {/* Khoảng giá - Sửa theo USD */}
              <div className="filter-group" style={{ marginBottom: "30px" }}>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                    marginBottom: "16px",
                  }}
                >
                  Max price ($)
                </h4>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#0f172a" }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "10px",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  <span>$0</span>
                  <span>${maxPrice}</span>
                </div>
              </div>

              {/* Danh mục phân cấp */}
              <div className="filter-group" style={{ marginBottom: "30px" }}>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                    marginBottom: "12px",
                  }}
                >
                  Categories
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {/* Lấy danh mục cha (Men, Women, Kids) */}
                  {categories
                    .filter((cat) => !cat.parent_id)
                    .map((parent) => (
                      <div
                        key={parent.id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        {/* Nút chọn cha */}
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        >
                          <input
                            type="radio"
                            name="cat"
                            checked={selectedCategory === parent.id}
                            onChange={() => setSelectedCategory(parent.id)}
                          />
                          <span>{parent.name}</span>
                        </label>

                        {/* Danh mục con thụt vào */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            paddingLeft: "16px",
                            gap: "6px",
                          }}
                        >
                          {categories
                            .filter((cat) => cat.parent_id === parent.id)
                            .map((child) => (
                              <label
                                key={child.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  fontWeight: "400",
                                }}
                              >
                                <input
                                  type="radio"
                                  name="cat"
                                  checked={selectedCategory === child.id}
                                  onChange={() => setSelectedCategory(child.id)}
                                />
                                <span>{child.name}</span>
                              </label>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Thương hiệu */}
              <div className="filter-group">
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                    marginBottom: "12px",
                  }}
                >
                  Brand
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {brands.map((b) => (
                    <label
                      key={b.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      <input
                        type="radio"
                        name="brand"
                        checked={selectedBrand === b.id}
                        onChange={() => setSelectedBrand(b.id)}
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* 4. MAIN PRODUCT LIST */}
          <main className="na-main">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px",
                padding: "16px",
                background: "#f8fafc",
                borderRadius: "12px",
              }}
            >
              <button
                className="lg-hidden btn-filter-mobile"
                onClick={() => setShowFilters(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                }}
              >
                <SlidersHorizontal size={18} /> filter
              </button>

              <p style={{ color: "#64748b", margin: 0, fontSize: "15px" }}>
                Show <strong>{sortedDisplayed.length}</strong> products
              </p>

              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span style={{ fontSize: "14px", color: "#64748b" }}>
                  sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    outline: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  <option value="newest">Latest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low </option>
                </select>
              </div>
            </div>

            {/* Grid Sản phẩm */}
            {sortedDisplayed.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "25px",
                }}
              >
                {sortedDisplayed.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "100px 0",
                  color: "#64748b",
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>📦</div>
                <h3>No matching products found</h3>
                <p>Try adjusting your filters.</p>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
