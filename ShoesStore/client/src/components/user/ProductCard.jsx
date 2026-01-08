import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function ProductCard({
  id,
  product_id,
  image,
  image_url,
  name,
  price,
  discount_percentage = 0, 
  extra,
  slug,
}) {
  const navigate = useNavigate();
  const finalId = id || product_id;
  const displayImage = image_url || image || "https://placehold.co/400x400?text=No+Image";

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (finalId) navigate(`/product/${finalId}`);
  };

  if (!finalId) return null;

 
  const finalPrice = discount_percentage > 0
    ? (price * (1 - discount_percentage / 100)).toFixed(2)
    : price.toFixed(2);

  return (
    <div className="card-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Link 
        to={`/product/${finalId}`} 
        className="card" 
        style={{ textDecoration: "none", color: "inherit", height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* Ảnh */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img 
            className="card-img" 
            src={displayImage} 
            alt={name} 
            style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }}
            onError={(e) => { e.target.src = "https://placehold.co/400?text=Error"; }}
          />

          {/* Nhãn Extra */}
          {extra && (
            <span className="pill-sm" style={{ position: "absolute", top: 10, left: 10, background: "black", color: "white", padding: "4px 8px", borderRadius: 4, fontSize: 12 }}>
              {extra}
            </span>
          )}

          {/* Nhãn giảm giá */}
          {discount_percentage > 0 && (
            <span style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "#dc2626",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 700
            }}>
              -{discount_percentage}%
            </span>
          )}
        </div>

        {/* Body */}
        <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h4 className="card-title" style={{ marginTop: 10, marginBottom: 5, fontSize: 16, fontWeight: 600 }}>
            {name}
          </h4>

          <div className="card-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
            {/* Giá sau giảm */}
            <span className="price" style={{ fontSize: 16, fontWeight: 700 }}>
              ${Number(finalPrice).toLocaleString()}
            </span>

            {/* Giá gốc gạch ngang nếu có giảm */}
            {discount_percentage > 0 && (
              <span style={{ textDecoration: "line-through", color: "#999", fontSize: 14 }}>
                ${Number(price).toLocaleString()}
              </span>
            )}
          </div>

          {/* Nút Select Options */}
          <button
            type="button"
            className="btn btn-primary pd-add"
            onClick={handleAddToCart}
            style={{ 
              marginTop: "auto", 
              width: "100%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 8,
              padding: "10px",
              cursor: "pointer",
              zIndex: 2
            }}
          >
            <ShoppingCart size={16} /> Select Options
          </button>
        </div>
      </Link>
    </div>
  );
}
