// client/src/components/user/ProductDetailPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronRight, Star, Minus, Plus, ShoppingCart, Heart } from "lucide-react";

import { getProductById } from "../../utilities/api";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        const productData = data?.items ? data.items[0] : data;

        if (productData) {
          setProduct(productData);
          const v = productData.variants || [];
          setVariants(Array.isArray(v) ? v : []);
        } else {
          setProduct(null);
          setVariants([]);
        }
      } catch (e) {
        console.error("Lỗi tải sản phẩm:", e);
        setProduct(null);
        setVariants([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  /* ================= DERIVED STATE ================= */
  const sizes = useMemo(() => {
    const s = new Set();
    variants.forEach((v) => {
      if (v.size !== undefined && v.size !== null && v.size !== "") s.add(v.size);
    });
    return Array.from(s).sort((a, b) => Number(a) - Number(b));
  }, [variants]);

  const colors = useMemo(() => {
    const c = new Set();
    variants.forEach((v) => {
      if (v.color) c.add(v.color);
    });
    return Array.from(c);
  }, [variants]);

  useEffect(() => {
    if (colors.length === 1 && !selectedColor) setSelectedColor(colors[0]);
  }, [colors, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (sizes.length > 0 && !selectedSize) return null;
    if (colors.length > 0 && !selectedColor) return null;

    return variants.find((v) => {
      const matchSize = !selectedSize || String(v.size) === String(selectedSize);
      const matchColor =
        !selectedColor ||
        String(v.color).toLowerCase() === String(selectedColor).toLowerCase();
      return matchSize && matchColor;
    });
  }, [variants, selectedSize, selectedColor, sizes.length, colors.length]);

  const inWishlist = product ? isInWishlist(product.id) : false;

  /* ================= HANDLERS ================= */
  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      await toggleWishlist(product.id);
    } catch (e) {
      if (String(e?.message || e).includes("Login")) {
        navigate("/login"); // hoặc /signin tùy router
      } else {
        console.error("Lỗi Wishlist:", e);
      }
    }
  };

  const handleAddToCart = async () => {
    if ((sizes.length > 0 && !selectedSize) || (colors.length > 0 && !selectedColor)) {
      alert("Vui lòng chọn đầy đủ Size và Màu sắc!");
      return;
    }

    if (!selectedVariant) {
      alert("Sản phẩm với tùy chọn này hiện không khả dụng.");
      return;
    }

    if (selectedVariant.stock < quantity) {
      alert(`Chỉ còn lại ${selectedVariant.stock} sản phẩm trong kho!`);
      return;
    }

    setIsAdding(true);
    try {
      const cartItemData = {
        product_id: product.id,
        variant_id: selectedVariant.id,
        name: product.name,
        image: selectedVariant.image_url || product.image_url || product.image,
        price: Number(product.price || 0),
        size: selectedVariant.size,
        color: selectedVariant.color,
        quantity: quantity,
      };

      await addToCart(cartItemData);
      setQuantity(1);
      alert("Đã thêm vào giỏ hàng thành công!");
    } catch (err) {
      console.error("Lỗi thêm giỏ hàng:", err);
      alert("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    } finally {
      setIsAdding(false);
    }
  };

  /* ================= UI RENDER ================= */
  if (loading) {
    return (
      <div className="container" style={{ padding: "100px 0", textAlign: "center" }}>
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: "100px 0", textAlign: "center" }}>
        <h2>Không tìm thấy sản phẩm</h2>
        <Link
          to="/"
          className="btn btn-primary"
          style={{ marginTop: 20, display: "inline-block" }}
        >
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const rating = Number(product.rating || 5.0);
  const reviewsCount = Number(product.reviews || 0);

  return (
    <main>
      {/* Breadcrumb */}
      <div className="breadcrumb" style={{ background: "#f8f9fa", padding: "10px 0" }}>
        <div
          className="container"
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14 }}
        >
          <Link to="/" style={{ color: "#666", textDecoration: "none" }}>
            Home
          </Link>
          <ChevronRight size={14} color="#999" />
          <span style={{ color: "#111", fontWeight: 500 }}>{product.name}</span>
        </div>
      </div>

      <section className="container" style={{ padding: "40px 0 80px" }}>
        <div
          className="pd-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "40px",
          }}
        >
          {/* LEFT: IMAGE */}
          <div className="pd-image-box">
            <img
              src={product.image_url || product.image || "https://placehold.co/600x600?text=No+Image"}
              alt={product.name}
              style={{
                width: "100%",
                borderRadius: "12px",
                objectFit: "cover",
                aspectRatio: "1/1",
                background: "#f1f1f1",
              }}
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/600x600?text=Image+Error";
              }}
            />
          </div>

          {/* RIGHT: INFO (CARD) */}
          <div
            className="pd-info-card"
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 14,
              padding: 24,
              minWidth: 0,
            }}
          >
            <h1 style={{ margin: "0 0 10px", fontSize: "28px" }}>{product.name}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 2, color: "#111" }}>
                <Star size={18} />
                <span style={{ fontWeight: 700 }}>{rating}</span>
              </div>
              <span style={{ color: "#666" }}>({reviewsCount} reviews)</span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "#111" }}>
                {Number(product.price).toLocaleString()}₫
              </span>
              {Number(product.discount_percentage || 0) > 0 && (
                <span
                  style={{
                    marginLeft: 10,
                    background: "#dc2626",
                    color: "#fff",
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  -{product.discount_percentage}%
                </span>
              )}
            </div>

            <p style={{ lineHeight: 1.6, color: "#444", marginBottom: 26 }}>
              {product.description || "Chưa có mô tả cho sản phẩm này."}
            </p>

            {/* OPTIONS: SIZE */}
            {sizes.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    display: "block",
                    marginBottom: 8,
                    color: "#111",
                  }}
                >
                  Select size
                </label>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        minWidth: 48,
                        height: 48,
                        border: selectedSize === size ? "2px solid #111" : "1px solid #e5e7eb",
                        background: selectedSize === size ? "#111" : "#fff",
                        color: selectedSize === size ? "#fff" : "#111",
                        borderRadius: 12,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* OPTIONS: COLOR */}
            {colors.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    display: "block",
                    marginBottom: 8,
                    color: "#111",
                  }}
                >
                  Select color
                </label>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: String(color).toLowerCase(),
                        border: selectedColor === color ? "2px solid #111" : "1px solid #e5e7eb",
                        boxShadow: selectedColor === color ? "0 0 0 2px white inset" : "none",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* STOCK STATUS MSG */}
            {selectedVariant ? (
              selectedVariant.stock === 0 ? (
                <p style={{ color: "#111", margin: "10px 0 0" }}>Hết hàng tạm thời</p>
              ) : (
                <p style={{ color: "#16a34a", fontSize: 14, margin: "10px 0 0" }}>
                  ✓ Còn hàng (Tồn kho: {selectedVariant.stock})
                </p>
              )
            ) : (
              <p style={{ color: "#666", fontSize: 14, margin: "10px 0 0" }}>
                Vui lòng chọn Size và Màu
              </p>
            )}

            {/* ACTION ROW (MATCH UI) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: 22,
                width: "100%",
              }}
            >
              {/* Quantity */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  height: 52,
                  width: 110,
                  padding: "0 10px",
                  background: "#fff",
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Minus size={16} />
                </button>

                <span style={{ fontWeight: 600, minWidth: 20, textAlign: "center" }}>
                  {quantity}
                </span>

                <button
                  onClick={() => {
                    if (selectedVariant && quantity >= selectedVariant.stock) return;
                    setQuantity((q) => q + 1);
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add to Cart (WIDE) */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || (selectedVariant && selectedVariant.stock === 0)}
                style={{
                  flex: 1,
                  height: 52,
                  border: "none",
                  borderRadius: 12,
                  background: "#5b5b5b",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  whiteSpace: "nowrap",
                  minWidth: 260,
                  opacity: isAdding || (selectedVariant && selectedVariant.stock === 0) ? 0.6 : 1,
                }}
              >
                <ShoppingCart size={20} />
                {isAdding ? "Processing..." : "Add to Cart"}
              </button>

              {/* Heart */}
              <button
                onClick={handleToggleWishlist}
                style={{
                  width: 52,
                  height: 52,
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <Heart
                  size={24}
                  color={inWishlist ? "#dc2626" : "#111"}
                  fill={inWishlist ? "#dc2626" : "none"}
                />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductDetail;
