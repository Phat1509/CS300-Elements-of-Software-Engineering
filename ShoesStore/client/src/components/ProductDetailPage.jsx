// src/components/ProductDetailPage.jsx
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star, Truck, RotateCcw, Shield, ChevronLeft } from "lucide-react";

// (mock) dữ liệu mẫu – tạm thời hiển thị chi tiết cố định
const productData = {
  id: 1,
  name: "Air Max Pro Running Shoes",
  category: "Men's Running Shoes",
  price: 159.99,
  originalPrice: 199.99,
  discount: 20,
  rating: 4.8,
  reviews: 342,
  isNew: true,
  inStock: true,
  description:
    "Experience ultimate comfort and performance with the Air Max Pro Running Shoes. Engineered with cutting-edge cushioning technology and breathable materials, these shoes are perfect for both casual runs and intense training sessions.",
  features: [
    "Premium breathable mesh upper for maximum ventilation",
    "Advanced cushioning technology for superior comfort",
    "Durable rubber outsole with multi-directional traction",
    "Lightweight design for enhanced performance",
    "Padded collar and tongue for added support",
  ],
  sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
  colors: [
    { name: "White/Blue", value: "#ffffff", image: "https://images.unsplash.com/photo-1717664644983-fa919d287460?q=80&w=1080&auto=format&fit=crop" },
    { name: "Black/Red", value: "#1a1a1a", image: "https://images.unsplash.com/photo-1690794250228-ec42fe151e28?q=80&w=1080&auto=format&fit=crop" },
    { name: "Navy/White", value: "#1e3a8a", image: "https://images.unsplash.com/photo-1614232296132-8e2b98031ab2?q=80&w=1080&auto=format&fit=crop" },
    { name: "Grey/Orange", value: "#6b7280", image: "https://images.unsplash.com/photo-1633464130613-0a9154299ac2?q=80&w=1080&auto=format&fit=crop" },
  ],
  specifications: {
    Brand: "SneakerHub",
    Model: "Air Max Pro",
    Material: "Mesh & Synthetic",
    "Sole Material": "Rubber",
    "Closure Type": "Lace-up",
    "Fit Type": "Regular",
  },
};

export default function ProductDetailPage() {
  const { id } = useParams(); // tạm chưa dùng – có thể load đúng sp theo id sau
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(productData.colors[0].image);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleColorChange = (index) => {
    setSelectedColor(index);
    setMainImage(productData.colors[index].image);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    alert(`Added ${quantity} item(s) to cart - Size: ${selectedSize}`);
  };

  return (
    <div className="pd">
      {/* breadcrumb */}
      <div className="pd-bc">
        <div className="container pd-bc-in">
          <Link to="/" className="pd-bc-link">Home</Link>
          <span className="pd-bc-sep">›</span>
          <Link to="/men" className="pd-bc-link">Men</Link>
          <span className="pd-bc-sep">›</span>
          <span>{productData.name}</span>
        </div>
      </div>

      {/* back mobile */}
      <div className="container pd-back">
        <button className="btn btn-outline gap-2" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} /> Back to Products
        </button>
      </div>

      {/* main two-columns */}
      <div className="container pd-main">
        {/* left: gallery */}
        <div className="pd-left">
          <div className="pd-mainimg">
            <img src={mainImage} alt={productData.name} />
            {productData.isNew && <span className="pd-badge pd-badge-new">New Arrival</span>}
            {productData.discount && <span className="pd-badge pd-badge-off">-{productData.discount}%</span>}
          </div>

          <div className="pd-thumbs">
            {productData.colors.map((c, i) => (
              <button
                key={c.name}
                onClick={() => handleColorChange(i)}
                className={`pd-thumb ${i === selectedColor ? "active" : ""}`}
              >
                <img src={c.image} alt={c.name} />
              </button>
            ))}
          </div>
        </div>

        {/* right: info */}
        <div className="pd-right">
          <h1 className="pd-title">{productData.name}</h1>
          <div className="pd-rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className={i < Math.floor(productData.rating) ? "star on" : "star"} />
            ))}
            <span className="pd-rating-text">
              {productData.rating} ({productData.reviews} reviews)
            </span>
          </div>
          <p className="muted">{productData.category}</p>

          <div className="pd-price">
            <strong>${productData.price}</strong>
            {productData.originalPrice && <span className="strike">${productData.originalPrice}</span>}
            {productData.discount && (
              <span className="save">Save ${(productData.originalPrice - productData.price).toFixed(2)}</span>
            )}
          </div>

          <hr className="pd-sep" />

          {/* Color */}
          <div className="pd-block">
            <div className="pd-row">
              <span className="pd-label">Color</span>
              <span className="muted">{productData.colors[selectedColor].name}</span>
            </div>
            <div className="pd-colors">
              {productData.colors.map((c, i) => (
                <button
                  key={c.name}
                  title={c.name}
                  onClick={() => handleColorChange(i)}
                  className={`pd-color ${i === selectedColor ? "active" : ""}`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="pd-block">
            <div className="pd-row">
              <span className="pd-label">Select Size</span>
              <button className="link-btn">Size Guide</button>
            </div>
            <div className="pd-sizes">
              {productData.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`pd-size ${selectedSize === s ? "active" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="pd-block">
            <span className="pd-label">Quantity</span>
            <div className="pd-qty">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity === 1}>
                –
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              {productData.inStock ? (
                <span className="pd-stock ok">In Stock</span>
              ) : (
                <span className="pd-stock no">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pd-actions">
            <button className="btn btn-primary pd-add" onClick={handleAddToCart} disabled={!productData.inStock}>
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button
              className={`btn ${isWishlisted ? "btn-primary" : "btn-outline"}`}
              onClick={() => setIsWishlisted((v) => !v)}
              aria-label="Wishlist"
            >
              <Heart size={18} />
            </button>
          </div>

          <hr className="pd-sep" />

          {/* Features */}
          <div className="pd-features">
            <h3>Key Features</h3>
            <ul>
              {productData.features.map((t) => (
                <li key={t}>✓ {t}</li>
              ))}
            </ul>
          </div>

          {/* Shipping/Returns/Warranty */}
          <div className="pd-infos">
            <div className="pd-info">
              <Truck size={18} />
              <div>
                <p className="info-title">Free Shipping</p>
                <p className="muted">On orders over $100</p>
              </div>
            </div>
            <div className="pd-info">
              <RotateCcw size={18} />
              <div>
                <p className="info-title">30-Day Returns</p>
                <p className="muted">Easy returns within 30 days</p>
              </div>
            </div>
            <div className="pd-info">
              <Shield size={18} />
              <div>
                <p className="info-title">2-Year Warranty</p>
                <p className="muted">Manufacturer warranty included</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description + Specs */}
      <div className="container pd-lower">
        <div className="pd-desc">
          <h2>Product Description</h2>
          <p className="muted">{productData.description}</p>
        </div>
        <div className="pd-specs">
          <h2>Specifications</h2>
          <div className="pd-spec-grid">
            {Object.entries(productData.specifications).map(([k, v]) => (
              <div key={k} className="pd-spec-row">
                <span className="muted">{k}</span>
                <span className="val">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
