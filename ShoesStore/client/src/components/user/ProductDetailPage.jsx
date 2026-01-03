// client/src/components/user/ProductDetailPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronRight, Star, Minus, Plus, ShoppingCart } from "lucide-react";
import { getProductDetail } from "../../ultilities/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Lấy User và hàm AddToCart từ Context
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho lựa chọn của user
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false); // Hiệu ứng loading nút bấm

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getProductDetail(slug);
        if (data) {
          setProduct(data);
          setVariants(data.variants || []);
          
          // Tự động chọn size/color đầu tiên nếu có để user đỡ phải bấm
          if (data.variants && data.variants.length > 0) {
            // Logic: Lấy các option unique
            // (Để đơn giản, ở đây user vẫn tự chọn, chỉ set variants)
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
    return [...new Set(variants.map((v) => v.size).filter(Boolean))].sort();
  }, [variants]);

  const colors = useMemo(() => {
    return [...new Set(variants.map((v) => v.color).filter(Boolean))];
  }, [variants]);

  // Tìm variant cụ thể dựa trên size và color đã chọn
  const selectedVariant = useMemo(() => {
    return variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
  }, [variants, selectedSize, selectedColor]);

  /* ================= HANDLER ================= */
  const handleAddToCart = async () => {
    // 1. Check Login
    if (!user) {
      alert("Please sign in to add items to your cart.");
      navigate("/signin");
      return;
    }

    // 2. Validate selection
    if (!selectedSize || !selectedColor) {
      alert("Please select a Size and a Color.");
      return;
    }

    if (!selectedVariant) {
      alert("This combination is currently unavailable.");
      return;
    }

    if (selectedVariant.stock < quantity) {
      alert(`Only ${selectedVariant.stock} items left in stock.`);
      return;
    }

    // 3. Call Context Action
    setIsAdding(true);
    try {
      // Hàm này từ CartContext sẽ tự update State và gọi API
      await addToCart(selectedVariant.variant_id, quantity);
      alert("Added to cart successfully!");
    } catch (error) {
      console.error("Failed to add to cart", error);
      alert("Failed to add to cart.");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div className="container" style={{padding: "40px"}}>Loading product...</div>;
  if (!product) return <div className="container" style={{padding: "40px"}}>Product not found.</div>;

  return (
    <>
      {/* Breadcrumbs */}
      <section className="men-bc">
        <div className="container" style={{ display: "flex", gap: 8 }}>
          <Link to="/" className="men-bc-link">Home</Link>
          <span className="men-bc-sep"><ChevronRight size={16} /></span>
          <Link to="/men" className="men-bc-link">Products</Link>
          <span className="men-bc-sep"><ChevronRight size={16} /></span>
          <span style={{ color: "#111" }}>{product.name}</span>
        </div>
      </section>

      {/* Main Content */}
      <section className="container" style={{ padding: "40px 0 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}>
          
          {/* LEFT: IMAGE */}
          <div className="product-image-wrapper" style={{ background: "#f8f8f8", borderRadius: "16px", overflow: "hidden" }}>
            <img 
              src={product.image_url} 
              alt={product.name} 
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
            />
          </div>

          {/* RIGHT: INFO */}
          <div className="product-info">
            <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "12px", lineHeight: 1.2 }}>
              {product.name}
            </h1>

            {/* Price & Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <span style={{ fontSize: "24px", fontWeight: "600", color: "#2563eb" }}>
                ${product.price.toFixed(2)}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px" }}>
                <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                <strong>4.8</strong> 
                <span className="muted">(120 reviews)</span>
              </div>
            </div>

            <p className="muted" style={{ lineHeight: "1.6", marginBottom: "32px" }}>
              {product.description || "Experience premium comfort and style with our latest collection. Perfect for everyday wear."}
            </p>

            {/* OPTIONS: SIZE */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <label style={{ fontWeight: "600", fontSize: "14px" }}>Select Size</label>
                <span className="link-btn" style={{ fontSize: "14px" }}>Size Guide</span>
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`btn btn-outline ${selectedSize === size ? "btn-active" : ""}`}
                    style={{ 
                      minWidth: "48px", 
                      borderColor: selectedSize === size ? "#111" : "#e5e7eb",
                      background: selectedSize === size ? "#111" : "white",
                      color: selectedSize === size ? "white" : "#111",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* OPTIONS: COLOR */}
            <div style={{ marginBottom: "32px" }}>
              <label style={{ fontWeight: "600", fontSize: "14px", display: "block", marginBottom: "8px" }}>
                Select Color: <span style={{fontWeight: 400}}>{selectedColor}</span>
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: color.toLowerCase(), // Giả sử tên màu là mã CSS hợp lệ (Red, Blue...)
                      border: selectedColor === color ? "2px solid #111" : "1px solid #e5e7eb",
                      boxShadow: selectedColor === color ? "0 0 0 2px white inset" : "none",
                      cursor: "pointer",
                      position: "relative"
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* STOCK WARNING */}
            {selectedVariant && selectedVariant.stock < 10 && selectedVariant.stock > 0 && (
               <p style={{ color: "#d97706", fontSize: "14px", marginBottom: "16px" }}>
                 Only {selectedVariant.stock} left in stock!
               </p>
            )}

            {/* ACTIONS: QTY & ADD BTN */}
            <div style={{ display: "flex", gap: "16px", height: "50px" }}>
              <div className="btn-group" style={{ 
                display: "flex", 
                alignItems: "center", 
                border: "1px solid #e5e7eb", 
                borderRadius: "8px",
                padding: "0 8px"
              }}>
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }}
                >
                  <Minus size={16} />
                </button>
                <span style={{ width: "32px", textAlign: "center", fontWeight: "600" }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button 
                className="btn btn-primary"
                style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", fontSize: "16px" }}
                onClick={handleAddToCart}
                disabled={isAdding || (selectedVariant && selectedVariant.stock === 0)}
              >
                {isAdding ? "Adding..." : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart - ${(product.price * quantity).toFixed(2)}
                  </>
                )}
              </button>
            </div>
            
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetail;