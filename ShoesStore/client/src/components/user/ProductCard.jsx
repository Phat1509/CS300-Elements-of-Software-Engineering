// client/src/components/user/ProductCard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";

export default function ProductCard({
  id,
  product_id,
  image,
  image_url,
  name,
  price,
  extra,
  slug, // Vẫn nhận nhưng không dùng làm ID chính
}) {
  const navigate = useNavigate();

  const { isInWishlist, toggleWishlist } = useWishlist();
  // 1. QUAN TRỌNG: Ưu tiên lấy ID (số) để khớp với API getProductById
  const finalId = id || product_id;

  // 2. Ưu tiên lấy image_url (theo API JSON bạn gửi)
  const displayImage = image_url || image || "https://placehold.co/400x400?text=No+Image";

  // Hàm chuyển hướng (dùng cho nút Add to Cart)
  const handleAddToCart = (e) => {
    e.preventDefault(); // Chặn sự kiện click của Link bao ngoài (nếu có)
    if (finalId) {
      navigate(`/product/${finalId}`);
    }
  };

  // Nếu không có ID thì không render gì cả để tránh lỗi
  if (!finalId) return null;

  return (
    /* Bọc toàn bộ Card bằng Link để click vào đâu cũng vào chi tiết.
       Sử dụng thẻ div class="card" bên trong để giữ nguyên giao diện cũ.
    */
    <div className="card-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Link 
        to={`/product/${finalId}`} 
        className="card" 
        style={{ textDecoration: "none", color: "inherit", height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* Phần Ảnh */}
        <div style={{ position: "relative", overflow: "hidden" }}>
            <img 
                className="card-img" 
                src={displayImage} 
                alt={name} 
                style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }}
                onError={(e) => { e.target.src = "https://placehold.co/400?text=Error"; }}
            />
            {/* Phần Heart */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();   // chặn Link
                e.stopPropagation();  // chặn bubble
                toggleWishlist(finalId);
              }}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "white",
                border: "none",
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 3,
              }}
              aria-label="Toggle wishlist"
            >
              <Heart
                size={18}
                fill={isInWishlist(finalId) ? "red" : "none"}
                color={isInWishlist(finalId) ? "red" : "black"}
              />
            </button>

            {/* Hiển thị nhãn Extra (VD: Sale, New) nếu có */}
            {extra && (
                <span className="pill-sm" style={{ position: "absolute", top: 10, left: 10, background: "black", color: "white", padding: "4px 8px", borderRadius: 4, fontSize: 12 }}>
                    {extra}
                </span>
            )}
        </div>

        {/* Phần Body */}
        <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h4 className="card-title" style={{ marginTop: 10, marginBottom: 5, fontSize: 16, fontWeight: 600 }}>
            {name}
          </h4>

          <div className="card-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
            <span className="price" style={{ fontSize: 16, fontWeight: 700 }}>
                ${Number(price || 0).toLocaleString()}
            </span>
          </div>

          {/* Nút Add to Cart - Thực chất là nút điều hướng sang trang chi tiết để chọn size */}
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
                zIndex: 2 // Đảm bảo nút này nằm trên layer Link
            }}
          >
            <ShoppingCart size={16} /> Select Options
          </button>
        </div>
      </Link>
    </div>
  );
}