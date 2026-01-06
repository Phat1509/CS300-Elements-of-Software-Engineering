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
import { useWishlist } from "../../context/WishlistContext";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
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
        const data = await getProductDetail(slug);
        setProduct(data);

        const v =
          data?.variants ||
          data?.product_variants ||
          data?.variant ||
          data?.product_variant ||
          [];
        setVariants(Array.isArray(v) ? v : []);
      } catch (e) {
        console.error("getProductDetail error:", e);
        setProduct(null);
        setVariants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  /* ================= DERIVED ================= */
  const sizes = useMemo(() => {
    const s = new Set();
    variants.forEach((v) => {
      if (v.size) s.add(v.size);
    });
    return Array.from(s);
  }, [variants]);

  const colors = useMemo(() => {
    const c = new Set();
    variants.forEach((v) => {
      if (v.color) c.add(v.color);
    });
    return Array.from(c);
  }, [variants]);

  const selectedVariant = useMemo(() => {
    if (!selectedSize || !selectedColor) return null;
    return (
      variants.find(
        (v) =>
          String(v.size).toLowerCase() === String(selectedSize).toLowerCase() &&
          String(v.color).toLowerCase() === String(selectedColor).toLowerCase()
      ) || null
    );
  }, [variants, selectedSize, selectedColor]);

  const productId = product ? (product.product_id || product.id) : null;
  const inWishlist = productId ? isInWishlist(productId) : false;

  /* ================= HANDLERS ================= */
  const handleToggleWishlist = async () => {
    if (!productId) return;
    try {
      await toggleWishlist(productId);
    } catch (e) {
      if (String(e?.message || e) === "NOT_LOGGED_IN") {
        navigate("/signin");
        return;
      }
      console.error("toggleWishlist error:", e);
    }
  };

  const handleAddToCart = async () => {
    // check variant chọn đủ chưa
    if (!selectedVariant) {
      alert("Please select size & color before adding to cart!");
      return;
    }

    // check stock
    if (selectedVariant.stock === 0) {
      alert("This variant is out of stock!");
      return;
    }

    setIsAdding(true);
    try {
      const cartItemData = {
        product_id: product.product_id || product.id,
        variant_id: selectedVariant.variant_id || selectedVariant.id, // Phải có cái này!

        name: product.name,
        image: product.image || product.image_url,
        price: Number(product.price || 0),
        size: selectedVariant.size,
        color: selectedVariant.color,
        quantity: quantity,

        slug: product.slug,
      };

      await addToCart(cartItemData);

      // Reset quantity
      setQuantity(1);

      alert("Added to cart successfully!");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add to cart!");
    } finally {
      setIsAdding(false);
    }
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="container" style={{ padding: "40px 0" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: "40px 0" }}>
        <p>Product not found.</p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  // Price tính theo variant nếu có
  const displayPrice = (() => {
    if (!product) return 0;
    const price = Number(product.price || 0);
    return price;
  })();

  const rating = Number(product.rating || 4.8);
  const reviewsCount = Number(product.reviews || 12);

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link> <ChevronRight size={16} />{" "}
          <span>{product.name}</span>
        </div>
      </div>

      <section className="container" style={{ padding: "30px 0 60px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "40px",
            alignItems: "start",
          }}
        >
          {/* LEFT: IMAGE */}
          <div className="card" style={{ padding: 18 }}>
            <img
              src={
                product.image ||
                product.image_url ||
                "https://via.placeholder.com/900"
              }
              alt={product.name}
              style={{
                width: "100%",
                height: "520px",
                objectFit: "cover",
                borderRadius: "12px",
              }}
            />
          </div>

          {/* RIGHT: INFO */}
          <div>
            <h1 style={{ margin: "0 0 12px", fontSize: "28px" }}>
              {product.name}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Star size={18} />
                <span style={{ fontWeight: 600 }}>{rating.toFixed(1)}</span>
              </div>
              <span style={{ color: "#666" }}>
                ({reviewsCount} reviews)
              </span>
            </div>

            <div style={{ marginTop: 14, marginBottom: 18 }}>
              <span style={{ fontSize: "26px", fontWeight: 700 }}>
                ${Number(displayPrice).toLocaleString()}
              </span>
            </div>

            {product.description && (
              <p style={{ lineHeight: 1.6, color: "#444" }}>
                {product.description}
              </p>
            )}

            {/* OPTIONS: SIZE */}
            <div style={{ marginTop: "26px", marginBottom: "22px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <label style={{ fontWeight: "600", fontSize: "14px" }}>
                  Select size
                </label>
                <button
                  type="button"
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#666" }}
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
                        padding: "10px 14px",
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
                Select color
              </label>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
                        selectedColor === color ? "0 0 0 2px white inset" : "none",
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
                <p style={{ marginBottom: 12, color: "#b45309" }}>
                  Low stock: only {selectedVariant.stock} left!
                </p>
              )}

            {selectedVariant && selectedVariant.stock === 0 && (
              <p style={{ marginBottom: 12, color: "#dc2626" }}>
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

                <span style={{ width: 32, textAlign: "center", fontWeight: 600 }}>
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
                <ShoppingCart size={18} />
                {isAdding ? "Adding..." : "Add to Cart"}
              </button>

              <button
                onClick={handleToggleWishlist}
                aria-label="Toggle wishlist"
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
                <Heart size={24} color="#111" fill={inWishlist ? "#111" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetail;