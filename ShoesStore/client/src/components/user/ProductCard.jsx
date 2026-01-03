// client/src/components/user/ProductCard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

// Nhận tất cả các biến thể tên có thể có của dữ liệu
export default function ProductCard({ 
  id, product_id,       // ID có thể là id hoặc product_id
  image, image_url,     // Ảnh có thể là image hoặc image_url
  name, 
  price, 
  extra, 
  slug 
}) {
  const navigate = useNavigate();

  // 1. Xác định ID chuẩn để tạo link (Ưu tiên slug -> id -> product_id)
  const finalId = slug || id || product_id;

  // 2. Xác định URL ảnh chuẩn
  const finalImage = image || image_url || "https://via.placeholder.com/300";

  const handleClick = (e) => {
    // Ngăn chặn sự kiện click lan truyền nếu cần thiết
    e && e.stopPropagation(); 
    // Nếu click vào nút Add to Cart thì chuyển hướng
    navigate(`/product/${finalId}`);
  };

  // Card UI (Giữ nguyên class cũ của bạn)
  const CardInner = (
    <div className="card">
      <img className="card-img" src={finalImage} alt={name} />
      <div className="card-body">
        <h4 className="card-title">{name}</h4>

        <div className="card-row">
          <span className="price">${price?.toLocaleString()}</span>
          {extra && <span className="pill-sm">{extra}</span>}
        </div>

        {/* Nút Add to Cart -> Chuyển hướng sang Detail để chọn size */}
        <button className="btn btn-primary pd-add" onClick={handleClick}>
          <ShoppingCart size={18} /> Add to Cart
        </button>
      </div>
    </div>
  );

  // Nếu không có ID thì chỉ render UI mà không có Link (tránh lỗi)
  if (!finalId) return CardInner;

  return (
    <Link to={`/product/${finalId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      {CardInner}
    </Link>
  );
}