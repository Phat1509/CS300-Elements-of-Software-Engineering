// client/src/components/user/OrderDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Copy,
  MapPin,
  Package,
  RotateCcw,
  Star,
  Truck,
  CreditCard,
  Calendar,
  X,
  CheckCircle2
} from "lucide-react";

import { getOrdersByUserId } from "../../utilities/api"; // Đảm bảo import đúng hàm API
import { useAuth } from "../../context/AuthContext";

// --- HELPER FUNCTIONS ---
const formatCurrency = (n) => (Number(n) || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const getStatusTheme = (rawStatus) => {
  const s = String(rawStatus || "PENDING").toUpperCase();
  switch (s) {
    case "DELIVERED":
      return { label: "Delivered", bg: "#dcfce7", color: "#166534", icon: CheckCircle2 };
    case "SHIPPED":
      return { label: "Shipped", bg: "#dbeafe", color: "#1e40af", icon: Truck };
    case "PROCESSING":
    case "PAID":
      return { label: "Processing", bg: "#fef3c7", color: "#92400e", icon: Package };
    case "CANCELLED":
      return { label: "Cancelled", bg: "#fee2e2", color: "#991b1b", icon: X };
    default:
      return { label: "Pending", bg: "#f1f5f9", color: "#475569", icon: Calendar };
  }
};

// --- SUB-COMPONENT: REVIEW MODAL ---
function ReviewModal({ open, onClose, rating, setRating, reviewText, setReviewText, onSave }) {
  if (!open) return null;

  return (
    <div style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }} onClick={onClose}>
      <div style={{
          background: "#fff", width: "100%", maxWidth: 500, borderRadius: 16,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden"
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Đánh giá sản phẩm</h3>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
                <p className="muted" style={{ marginBottom: 12 }}>Bạn cảm thấy đơn hàng này thế nào?</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setRating(star)} style={{ background: "none", border: "none", cursor: "pointer", transition: "transform 0.1s" }}>
                            <Star 
                                size={32} 
                                fill={star <= rating ? "#fbbf24" : "transparent"} 
                                color={star <= rating ? "#fbbf24" : "#cbd5e1"} 
                                strokeWidth={1.5}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                style={{
                    width: "100%", minHeight: 100, padding: 12, borderRadius: 8,
                    border: "1px solid #cbd5e1", outline: "none", fontSize: 14, fontFamily: "inherit"
                }}
            />
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button onClick={onClose} className="btn btn-outline" style={{ border: "1px solid #cbd5e1" }}>Hủy</button>
            <button onClick={onSave} disabled={rating === 0} className="btn btn-primary" style={{ opacity: rating === 0 ? 0.5 : 1 }}>Gửi đánh giá</button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  
  // Review State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // --- FETCH DATA ---
  useEffect(() => {
    if (!isAuthenticated) { 
        setLoading(false); 
        return; 
    }

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const userId = user.id || user.user_id;
        // API thường trả về list, ta lọc client-side (hoặc gọi API getOrderById nếu có)
        const list = await getOrdersByUserId(userId); 
        const found = list.find((o) => String(o.id) === String(id) || String(o.order_id) === String(id));
        setOrder(found || null);
      } catch (e) {
        console.error("Error loading order:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user, isAuthenticated]);

  // --- ACTIONS ---
  const handleCopyTracking = () => {
    if (order?.tracking_number) {
        navigator.clipboard.writeText(order.tracking_number);
        alert("Đã sao chép mã vận đơn!");
    }
  };

  const handleSaveReview = () => {
    // TODO: Gọi API lưu review lên server
    console.log("Saving review:", { orderId: id, rating, reviewText });
    
    // Giả lập lưu vào localStorage
    const key = `review_${id}`;
    localStorage.setItem(key, JSON.stringify({ rating, text: reviewText, date: new Date() }));
    
    alert("Cảm ơn bạn đã đánh giá!");
    setIsReviewOpen(false);
  };

  // --- RENDER HELPERS ---
  if (!isAuthenticated && !loading) {
    return (
        <div className="container" style={{ padding: "100px 0", textAlign: "center" }}>
            <h3>Vui lòng đăng nhập</h3>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Đăng nhập</Link>
        </div>
    );
  }

  if (loading) {
      return <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>Đang tải thông tin đơn hàng...</div>;
  }

  if (!order) {
      return (
        <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
            <h3>Không tìm thấy đơn hàng</h3>
            <p className="muted">Đơn hàng #{id} không tồn tại hoặc bạn không có quyền truy cập.</p>
            <button onClick={() => navigate("/orders")} className="btn btn-outline" style={{ marginTop: 16 }}>
                <ArrowLeft size={16} style={{ marginRight: 8 }}/> Quay lại danh sách
            </button>
        </div>
      );
  }

  const statusTheme = getStatusTheme(order.status);
  const StatusIcon = statusTheme.icon;
  const items = order.items || order.order_items || [];
  const displayId = order.id || order.order_id;
  const canReview = String(order.status).toUpperCase() === "DELIVERED";

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: 60 }}>
      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div className="container" style={{ padding: "16px 0", display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#64748b" }}>
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Trang chủ</Link>
            <ChevronRight size={14} />
            <Link to="/orders" style={{ color: "inherit", textDecoration: "none" }}>Đơn hàng</Link>
            <ChevronRight size={14} />
            <span style={{ color: "#0f172a", fontWeight: 500 }}>#{displayId}</span>
        </div>
      </div>

      <main className="container" style={{ marginTop: 32 }}>
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div>
                <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>Chi tiết đơn hàng #{displayId}</h1>
                <div style={{ fontSize: 14, color: "#64748b" }}>
                    Ngày đặt: {formatDate(order.created_at)}
                </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                 {/* Status Pill */}
                <div style={{ 
                    display: "flex", alignItems: "center", gap: 8, 
                    padding: "8px 16px", borderRadius: 99, 
                    background: statusTheme.bg, color: statusTheme.color,
                    fontWeight: 600, fontSize: 14
                }}>
                    <StatusIcon size={18} />
                    {statusTheme.label}
                </div>
            </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            
            {/* LEFT COL: Items List */}
            <div style={{ flex: 2, minWidth: "60%" }}>
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                    <div style={{ padding: "16px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>
                        Sản phẩm ({items.length})
                    </div>
                    <div>
                        {items.map((item, idx) => (
                            <div key={idx} style={{ padding: 24, borderBottom: idx === items.length -1 ? "none" : "1px solid #f1f5f9", display: "flex", gap: 16 }}>
                                <div style={{ width: 80, height: 80, borderRadius: 8, background: "#f1f5f9", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                                    <img 
                                        src={item.image || item.image_url || "https://placehold.co/80"} 
                                        alt={item.product_name} 
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>{item.product_name || item.name}</div>
                                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                                        {item.size && `Size: ${item.size}`} {item.color && `• Color: ${item.color}`}
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ fontSize: 14 }}>x{item.quantity}</div>
                                        <div style={{ fontWeight: 600 }}>{formatCurrency(item.price)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions Row */}
                <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button onClick={() => navigate('/')} className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <RotateCcw size={16} /> Mua lại
                    </button>
                    {canReview && (
                        <button onClick={() => setIsReviewOpen(true)} className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Star size={16} /> Viết đánh giá
                        </button>
                    )}
                </div>
            </div>

            {/* RIGHT COL: Summary Info */}
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    
                    {/* Payment Summary */}
                    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
                        <h4 style={{ margin: "0 0 16px", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <CreditCard size={18} color="#64748b"/> Thanh toán
                        </h4>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: "#64748b" }}>
                            <span>Tạm tính</span>
                            <span>{formatCurrency(items.reduce((acc, i) => acc + (i.price * i.quantity), 0))}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: "#64748b" }}>
                            <span>Phí vận chuyển</span>
                            <span>{formatCurrency(order.shipping_fee || 0)}</span>
                        </div>
                        <div style={{ borderTop: "1px dashed #e2e8f0", margin: "12px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                            <span>Tổng cộng</span>
                            <span>{formatCurrency(order.total_amount)}</span>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
                        <h4 style={{ margin: "0 0 16px", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <MapPin size={18} color="#64748b"/> Địa chỉ nhận hàng
                        </h4>
                        <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                            <div style={{ fontWeight: 600 }}>{user?.full_name || user?.username}</div>
                            <div>{order.phone || user?.phone || "0987 *** ***"}</div>
                            <div style={{ color: "#64748b", marginTop: 4 }}>
                                {order.address || order.shipping_address || "Địa chỉ mặc định của khách hàng"}
                            </div>
                        </div>
                    </div>

                    {/* Tracking Info (Optional) */}
                    {order.tracking_number && (
                        <div style={{ background: "#f0f9ff", borderRadius: 12, border: "1px solid #bae6fd", padding: 20 }}>
                            <div style={{ fontSize: 13, color: "#0369a1", marginBottom: 4, fontWeight: 600 }}>MÃ VẬN ĐƠN</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 16, fontWeight: 700, color: "#0284c7" }}>{order.tracking_number}</span>
                                <button onClick={handleCopyTracking} title="Copy" style={{ background: "none", border: "none", cursor: "pointer", color: "#0369a1" }}>
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </main>

      <ReviewModal 
        open={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)}
        rating={rating}
        setRating={setRating}
        reviewText={reviewText}
        setReviewText={setReviewText}
        onSave={handleSaveReview}
      />
    </div>
  );
}