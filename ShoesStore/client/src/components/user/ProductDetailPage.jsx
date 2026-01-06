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
// Đảm bảo bạn đã export hàm getProductById trong api.js
import { getProductById } from "../../utilities/api"; 
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const ProductDetail = () => {
  // Đổi slug thành id để khớp với logic ProductCard (Link to={`/product/${id}`})
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
        // Gọi API lấy chi tiết theo ID
        const data = await getProductById(id);

        // Xử lý trường hợp API trả về mảng items (do JSON mẫu bạn gửi có items: [])
        // Nếu data là mảng hoặc có thuộc tính items, ta lấy phần tử đầu tiên
        const productData = data.items ? data.items[0] : data;

        if (productData) {
          setProduct(productData);
          // Lấy variants an toàn
          const v = productData.variants || [];
          setVariants(Array.isArray(v) ? v : []);
        } else {
          setProduct(null);
        }
      } catch (e) {
        console.error("Lỗi tải sản phẩm:", e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  /* ================= DERIVED STATE ================= */
  // Lọc ra danh sách Size duy nhất (Sắp xếp tăng dần)
  const sizes = useMemo(() => {
    const s = new Set();
    variants.forEach((v) => {
      if (v.size) s.add(v.size);
    });
    return Array.from(s).sort((a, b) => Number(a) - Number(b));
  }, [variants]);

  // Lọc ra danh sách Color duy nhất
  const colors = useMemo(() => {
    const c = new Set();
    variants.forEach((v) => {
      if (v.color) c.add(v.color);
    });
    return Array.from(c);
  }, [variants]);

  // Tự động chọn màu nếu chỉ có 1 màu duy nhất
  useEffect(() => {
    if (colors.length === 1 && !selectedColor) {
      setSelectedColor(colors[0]);
    }
  }, [colors, selectedColor]);

  // Tìm Variant dựa trên Size và Color đang chọn
  const selectedVariant = useMemo(() => {
    // Nếu chưa chọn đủ size/color (nếu có options), trả về null
    if (sizes.length > 0 && !selectedSize) return null;
    if (colors.length > 0 && !selectedColor) return null;

    // Tìm variant khớp
    return variants.find((v) => {
      const matchSize = !selectedSize || String(v.size) === String(selectedSize);
      const matchColor = !selectedColor || String(v.color).toLowerCase() === String(selectedColor).toLowerCase();
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
      // Nếu chưa login thì chuyển hướng
      if (String(e?.message || e).includes("Login")) {
        navigate("/login"); // Hoặc /signin tùy router của bạn
      } else {
        console.error("Lỗi Wishlist:", e);
      }
    }
  };

  const handleAddToCart = async () => {
    // 1. Validate chọn Size/Color
    if ((sizes.length > 0 && !selectedSize) || (colors.length > 0 && !selectedColor)) {
      alert("Vui lòng chọn đầy đủ Size và Màu sắc!");
      return;
    }

    // 2. Validate tìm thấy Variant
    if (!selectedVariant) {
      alert("Sản phẩm với tùy chọn này hiện không khả dụng.");
      return;
    }

    // 3. Validate Stock
    if (selectedVariant.stock < quantity) {
      alert(`Chỉ còn lại ${selectedVariant.stock} sản phẩm trong kho!`);
      return;
    }

    setIsAdding(true);
    try {
      const cartItemData = {
        product_id: product.id,
        variant_id: selectedVariant.id, // ID của biến thể (quan trọng để trừ kho)
        name: product.name,
        // Ưu tiên ảnh variant nếu có, không thì lấy ảnh product
        image: selectedVariant.image_url || product.image_url || product.image, 
        price: Number(product.price || 0),
        size: selectedVariant.size,
        color: selectedVariant.color,
        quantity: quantity,
      };

      await addToCart(cartItemData);
      setQuantity(1); // Reset số lượng
      // Có thể thêm toast notification ở đây thay vì alert
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
    return <div className="container" style={{ padding: "100px 0", textAlign: "center" }}>Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: "100px 0", textAlign: "center" }}>
        <h2>Không tìm thấy sản phẩm</h2>
        <Link to="/" className="btn btn-primary" style={{marginTop: 20, display: "inline-block"}}>Quay về trang chủ</Link>
      </div>
    );
  }

  const rating = Number(product.rating || 5.0);
  const reviewsCount = Number(product.reviews || 0);

  return (
    <main>
      {/* Breadcrumb */}
      <div className="breadcrumb" style={{background: "#f8f9fa", padding: "10px 0"}}>
        <div className="container" style={{display: "flex", alignItems: "center", gap: 5, fontSize: 14}}>
          <Link to="/" style={{color: "#666", textDecoration: "none"}}>Home</Link> 
          <ChevronRight size={14} color="#999" />
          <span style={{color: "#111", fontWeight: 500}}>{product.name}</span>
        </div>
      </div>

      <section className="container" style={{ padding: "40px 0 80px" }}>
        <div className="pd-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
          
          {/* LEFT: IMAGE */}
          <div className="pd-image-box">
            <img
              src={product.image_url || product.image || "https://placehold.co/600x600?text=No+Image"}
              alt={product.name}
              style={{ width: "100%", borderRadius: "12px", objectFit: "cover", aspectRatio: "1/1", background: "#f1f1f1" }}
              onError={(e) => { e.target.src = "https://placehold.co/600x600?text=Image+Error"; }}
            />
          </div>

          {/* RIGHT: INFO */}
          <div className="pd-info">
            <h1 style={{ margin: "0 0 10px", fontSize: "28px" }}>{product.name}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 2, color: "#facc15" }}>
                <Star size={18} fill="#facc15" />
                <span style={{ fontWeight: 700, color: "#111" }}>{rating}</span>
              </div>
              <span style={{ color: "#888" }}>({reviewsCount} đánh giá)</span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "#dc2626" }}>
                {Number(product.price).toLocaleString()}₫
              </span>
              {product.discount_percentage > 0 && (
                 <span style={{marginLeft: 10, background: "#dc2626", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 12}}>
                    -{product.discount_percentage}%
                 </span>
              )}
            </div>

            <p style={{ lineHeight: 1.6, color: "#555", marginBottom: 30 }}>
              {product.description || "Chưa có mô tả cho sản phẩm này."}
            </p>

            {/* OPTIONS: SIZE */}
            {sizes.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "600", fontSize: "14px", display: "block", marginBottom: 8 }}>
                  Chọn Size: <span style={{fontWeight: 400}}>{selectedSize}</span>
                </label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        minWidth: "45px",
                        height: "45px",
                        border: selectedSize === size ? "2px solid #111" : "1px solid #ddd",
                        background: selectedSize === size ? "#111" : "#fff",
                        color: selectedSize === size ? "#fff" : "#333",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 600
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
              <div style={{ marginBottom: "30px" }}>
                <label style={{ fontWeight: "600", fontSize: "14px", display: "block", marginBottom: 8 }}>
                   Chọn Màu: <span style={{fontWeight: 400}}>{selectedColor}</span>
                </label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: color.toLowerCase(),
                        border: selectedColor === color ? "2px solid #111" : "1px solid #ddd",
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
                    <p style={{color: "red", fontWeight: 600}}>Hết hàng tạm thời</p>
                ) : (
                    <p style={{color: "#16a34a", fontSize: 14}}>
                        ✓ Còn hàng (Tồn kho: {selectedVariant.stock})
                    </p>
                )
            ) : (
                <p style={{color: "#666", fontSize: 14}}>Vui lòng chọn Size và Màu</p>
            )}

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", gap: "12px", marginTop: 15, height: 50 }}>
              {/* Quantity */}
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "8px", padding: "0 5px" }}>
                <button 
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{border: "none", background: "none", cursor: "pointer", padding: 8}}
                ><Minus size={16} /></button>
                <span style={{ width: 30, textAlign: "center", fontWeight: 600 }}>{quantity}</span>
                <button 
                  onClick={() => {
                     // Không cho tăng quá stock
                     if (selectedVariant && quantity >= selectedVariant.stock) return;
                     setQuantity((q) => q + 1)
                  }}
                  style={{border: "none", background: "none", cursor: "pointer", padding: 8}}
                ><Plus size={16} /></button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || (selectedVariant && selectedVariant.stock === 0)}
                style={{
                  flex: 1,
                  background: "#111", color: "#fff", border: "none", borderRadius: "8px",
                  fontSize: "16px", fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  opacity: (isAdding || (selectedVariant && selectedVariant.stock === 0)) ? 0.6 : 1
                }}
              >
                <ShoppingCart size={20} />
                {isAdding ? "Đang xử lý..." : "Thêm vào giỏ"}
              </button>

              {/* Wishlist */}
              <button
                onClick={handleToggleWishlist}
                style={{
                  width: 50, border: "1px solid #ddd", borderRadius: "8px", background: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                }}
              >
                <Heart size={24} color={inWishlist ? "#dc2626" : "#111"} fill={inWishlist ? "#dc2626" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductDetail;