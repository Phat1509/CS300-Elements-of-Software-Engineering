// client/src/components/user/ProductDetailPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { getProductDetail } from "../../utilities/api"; // Chú ý đường dẫn import api
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { addToCart } = useCart(); // Giả sử Context xử lý việc gọi API

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho lựa chọn
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getProductDetail(slug);

        if (data) {
          setProduct(data);

          // --- [ĐÃ SỬA] Lấy variants thật từ DB ---
          // Code api.js đã xử lý việc gộp variants vào đây rồi
          const realVariants = data.variants || data.product_variants || [];
          setVariants(realVariants);

          // Tự động chọn size/màu đầu tiên còn hàng
          const firstAvailable = realVariants.find((v) => v.stock > 0);
          if (firstAvailable) {
            setSelectedSize(firstAvailable.size);
            setSelectedColor(firstAvailable.color);
          }
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  /* ================= CALCULATE OPTIONS ================= */
  const sizes = useMemo(() => {
    return [...new Set(variants.map((v) => v.size))].sort();
  }, [variants]);

  const colors = useMemo(() => {
    return [...new Set(variants.map((v) => v.color))];
  }, [variants]);

  const selectedVariant = useMemo(() => {
    return variants.find((v) => {
      return v.size === selectedSize && v.color === selectedColor;
    });
  }, [variants, selectedSize, selectedColor]);

  /* ================= PRICE CALCULATION ================= */
  const finalPrice = useMemo(() => {
    if (!product) return 0;
    const price = Number(product.price) || 0;
    const discount = Number(product.discount_percentage) || 0;

    if (discount > 0) {
      return price * (1 - discount / 100);
    }
    return price;
  }, [product]);

  /* ================= HANDLER ================= */
  const handleAddToCart = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng.");
      navigate("/signin");
      return;
    }

    if (!selectedSize || !selectedColor) {
      alert("Vui lòng chọn Size và Màu sắc.");
      return;
    }

    if (!selectedVariant) {
      alert("Phiên bản này hiện không khả dụng.");
      return;
    }

    if (selectedVariant.stock < quantity) {
      alert(`Chỉ còn lại ${selectedVariant.stock} sản phẩm trong kho.`);
      return;
    }

    setIsAdding(true);
    try {
      // --- [QUAN TRỌNG] Tạo object Item chuẩn ---
      const cartItemData = {
        // IDs quan trọng nhất để lưu xuống DB
        product_id: product.product_id || product.id,
        variant_id: selectedVariant.variant_id || selectedVariant.id, // Phải có cái này!

        // Các thông tin hiển thị (cho UI Context render ngay lập tức)
        name: product.name,
        price: finalPrice,
        image: product.image_url,
        size: selectedSize,
        color: selectedColor,
        stock: selectedVariant.stock, // Để check max quantity trong giỏ
        quantity: quantity,
      };

      // Gọi hàm từ Context.
      // Lưu ý: Đảm bảo CartContext của bạn truyền đúng tham số xuống api.addToCart
      await addToCart(cartItemData, quantity);

      alert("Đã thêm vào giỏ hàng thành công!");
    } catch (error) {
      console.error("Failed to add to cart", error);
      alert("Lỗi khi thêm vào giỏ hàng.");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading)
    return (
      <div
        className="container"
        style={{ padding: "100px 0", textAlign: "center" }}
      >
        Đang tải...
      </div>
    );
  if (!product)
    return (
      <div
        className="container"
        style={{ padding: "100px 0", textAlign: "center" }}
      >
        Không tìm thấy sản phẩm.
      </div>
    );

  return (
    <main className="men-wrap">
      {/* Breadcrumbs */}
      <section className="men-bc">
        <div
          className="container"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Link to="/" className="men-bc-link">
            Trang chủ
          </Link>
          <ChevronRight size={14} className="muted" />
          <Link
            to={
              product.category_id === 1
                ? "/men"
                : product.category_id === 2
                ? "/women"
                : "/kids"
            }
            className="men-bc-link"
          >
            {product.category_id === 1
              ? "Nam"
              : product.category_id === 2
              ? "Nữ"
              : "Trẻ em"}
          </Link>
          <ChevronRight size={14} className="muted" />
          <span style={{ color: "#111", fontWeight: 500 }}>{product.name}</span>
        </div>
      </section>

      {/* Main Content */}
      <section className="container" style={{ padding: "40px 0 80px" }}>
        <div
          className="product-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "48px",
          }}
        >
          {/* LEFT: IMAGE */}
          <div
            className="product-image-wrapper"
            style={{
              background: "#f5f5f5",
              borderRadius: "16px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {product.discount_percentage > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  background: "#ef4444",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "4px",
                  fontWeight: "bold",
                }}
              >
                -{product.discount_percentage}%
              </div>
            )}
            <img
              src={product.image_url}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
                minHeight: "400px",
              }}
            />
          </div>

          {/* RIGHT: INFO */}
          <div className="product-info">
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "800",
                marginBottom: "12px",
                lineHeight: 1.2,
              }}
            >
              {product.name}
            </h1>

            {/* Price & Rating */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "baseline", gap: "8px" }}
              >
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#ef4444",
                  }}
                >
                  {finalPrice.toLocaleString()}₫
                </span>
                {product.discount_percentage > 0 && (
                  <span
                    style={{
                      fontSize: "18px",
                      textDecoration: "line-through",
                      color: "#9ca3af",
                    }}
                  >
                    {product.price.toLocaleString()}₫
                  </span>
                )}
              </div>
              <div
                style={{ width: "1px", height: "24px", background: "#e5e7eb" }}
              ></div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "14px",
                }}
              >
                <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                <strong>4.8</strong>{" "}
                <span className="muted">(120 đánh giá)</span>
              </div>
            </div>

            <p
              className="muted"
              style={{ lineHeight: "1.6", marginBottom: "32px" }}
            >
              {product.description || "Mô tả đang cập nhật..."}
            </p>

            {/* OPTIONS: SIZE */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <label style={{ fontWeight: "600", fontSize: "14px" }}>
                  Chọn Size
                </label>
                <button
                  className="link-btn"
                  style={{ fontSize: "14px", color: "#666" }}
                >
                  Hướng dẫn chọn size
                </button>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {sizes.length > 0 ? (
                  sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`size-option ${
                        selectedSize === size ? "active" : ""
                      }`}
                      style={{
                        minWidth: "48px",
                        height: "48px",
                        border:
                          selectedSize === size
                            ? "2px solid #111"
                            : "1px solid #e5e7eb",
                        background: selectedSize === size ? "#111" : "white",
                        color: selectedSize === size ? "white" : "#111",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      {size}
                    </button>
                  ))
                ) : (
                  <p>Hết hàng toàn bộ các size</p>
                )}
              </div>
            </div>

            {/* OPTIONS: COLOR */}
            <div style={{ marginBottom: "32px" }}>
              <label
                style={{
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Màu sắc:{" "}
                <span style={{ fontWeight: 400 }}>{selectedColor}</span>
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background:
                        color.toLowerCase() === "white"
                          ? "#fff"
                          : color.toLowerCase(),
                      border:
                        selectedColor === color
                          ? "2px solid #111"
                          : "1px solid #e5e7eb",
                      boxShadow:
                        selectedColor === color
                          ? "0 0 0 2px white inset"
                          : "none",
                      cursor: "pointer",
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* STOCK WARNING */}
            {selectedVariant &&
              selectedVariant.stock < 10 &&
              selectedVariant.stock > 0 && (
                <p
                  style={{
                    color: "#d97706",
                    fontSize: "14px",
                    marginBottom: "16px",
                    fontWeight: 500,
                  }}
                >
                  🔥 Chỉ còn {selectedVariant.stock} sản phẩm!
                </p>
              )}

            {selectedVariant && selectedVariant.stock === 0 && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "14px",
                  marginBottom: "16px",
                  fontWeight: 500,
                }}
              >
                Hết hàng tạm thời
              </p>
            )}

            {/* ACTIONS */}
            <div style={{ display: "flex", gap: "16px", height: "56px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "0 8px",
                }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px",
                  }}
                >
                  <Minus size={16} />
                </button>
                <span
                  style={{
                    width: "32px",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px",
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "16px",
                  fontWeight: 600,
                  background: "#111",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor:
                    isAdding || !selectedVariant || selectedVariant.stock === 0
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    isAdding || !selectedVariant || selectedVariant.stock === 0
                      ? 0.7
                      : 1,
                }}
                onClick={handleAddToCart}
                disabled={
                  isAdding || !selectedVariant || selectedVariant.stock === 0
                }
              >
                {isAdding ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    {!selectedVariant || selectedVariant.stock === 0
                      ? "Hết hàng"
                      : `Thêm vào giỏ - ${(
                          finalPrice * quantity
                        ).toLocaleString()}₫`}
                  </>
                )}
              </button>

              <button
                style={{
                  width: "56px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <Heart size={24} color="#111" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductDetail;
