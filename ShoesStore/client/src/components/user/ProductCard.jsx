// client/src/components/user/ProductCard.jsx
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
  extra,
  slug,
}) {
  const navigate = useNavigate();

  // Ưu tiên slug -> id -> product_id
  const finalId = slug || id || product_id;

  // Ưu tiên image -> image_url
  const finalImage = image || image_url || "https://via.placeholder.com/300";

  const goDetail = () => {
    if (!finalId) return;
    navigate(`/product/${finalId}`);
  };

  const handleAddToCartClick = (e) => {
    // ✅ chặn Link bọc ngoài (tránh navigate 2 lần)
    e.preventDefault();
    e.stopPropagation();
    goDetail();
  };

  const CardInner = (
    <div className="card" role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && goDetail()}>
      <img className="card-img" src={finalImage} alt={name} />
      <div className="card-body">
        <h4 className="card-title">{name}</h4>

        <div className="card-row">
          <span className="price">${Number(price || 0).toLocaleString()}</span>
          {extra && <span className="pill-sm">{extra}</span>}
        </div>

        <button
          type="button"
          className="btn btn-primary pd-add"
          onClick={handleAddToCartClick}
          disabled={!finalId}
        >
          <ShoppingCart size={18} /> Add to Cart
        </button>
      </div>
    </div>
  );

  if (!finalId) return CardInner;

  return (
    <Link to={`/product/${finalId}`} style={{ textDecoration: "none", color: "inherit" }}>
      {CardInner}
    </Link>
  );
}