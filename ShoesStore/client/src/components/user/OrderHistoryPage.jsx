// client/src/components/user/OrderHistoryPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Package, Truck, CheckCircle2, Clock, Calendar, ArrowRight, ShoppingBag } from "lucide-react";
import { getOrdersByUserId } from "../../utilities/api";
import { useAuth } from "../../context/AuthContext"; // Import Auth Context

// --- HELPER FUNCTIONS ---
const formatCurrency = (n) => (Number(n) || 0).toLocaleString("en-US") + "$"; // Đổi sang $ cho đồng bộ với Cart
// Nếu muốn dùng VND: 
// const formatCurrency = (n) => (Number(n) || 0).toLocaleString("vi-VN") + "₫";

const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};

const getStatusConfig = (status) => {
  const s = String(status || "PENDING").toUpperCase();
  switch (s) {
    case "DELIVERED":
      return { text: "Delivered", color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2 };
    case "SHIPPED":
      return { text: "Shipped", color: "#2563eb", bg: "#dbeafe", icon: Truck };
    case "PROCESSING":
    case "PAID":
      return { text: "Processing", color: "#d97706", bg: "#fef3c7", icon: Package };
    case "CANCELLED":
      return { text: "Cancelled", color: "#dc2626", bg: "#fee2e2", icon: Package }; // Thêm trạng thái hủy
    default:
      return { text: "Pending", color: "#64748b", bg: "#f1f5f9", icon: Clock };
  }
};

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); // Dùng hook chuẩn

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  // --- LOAD DATA ---
  useEffect(() => {
    // Nếu chưa đăng nhập thì thôi, để UI ở dưới xử lý redirect
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const userId = user.user_id || user.id;
        const list = await getOrdersByUserId(userId);
        if (mounted) {
          setOrders(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        console.error("Lỗi tải đơn hàng:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrders();

    return () => { mounted = false; };
  }, [user, isAuthenticated]);

  // --- FILTER & SORT ---
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // 1. Sort: Mới nhất lên đầu
    result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    // 2. Filter theo Search & Status
    if (q || filter !== "all") {
      const lowerQ = q.toLowerCase();
      result = result.filter(o => {
        const s = String(o.status || "").toUpperCase();
        
        // Match search text
        const matchText = 
            String(o.id).includes(lowerQ) || 
            String(o.total_amount).includes(lowerQ);

        // Match status dropdown
        let matchFilter = true;
        if (filter === "pending") matchFilter = s === "PENDING" || s === "PLACED";
        if (filter === "processing") matchFilter = s === "PROCESSING" || s === "PAID";
        if (filter === "shipped") matchFilter = s === "SHIPPED";
        if (filter === "delivered") matchFilter = s === "DELIVERED";

        return matchText && matchFilter;
      });
    }
    return result;
  }, [orders, q, filter]);

  // --- STATS ---
  const stats = useMemo(() => {
    return {
      total: orders.length,
      delivered: orders.filter(o => String(o.status).toUpperCase() === "DELIVERED").length,
      processing: orders.filter(o => ["PENDING", "PAID", "PROCESSING", "SHIPPED"].includes(String(o.status).toUpperCase())).length,
      spent: orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0)
    };
  }, [orders]);

  // --- UI: NOT LOGGED IN ---
  if (!isAuthenticated && !loading) {
     return (
        <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
            <h3>Vui lòng đăng nhập</h3>
            <p className="muted">Bạn cần đăng nhập để xem lịch sử mua hàng.</p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: 20, display: "inline-block" }}>
                Đăng nhập ngay
            </Link>
        </div>
     )
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: 60 }}>
      {/* HEADER & STATS */}
      <section style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "40px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div>
                <h1 style={{ margin: "0 0 8px", fontSize: "28px" }}>Lịch sử đơn hàng</h1>
                <p className="muted" style={{ margin: 0 }}>Quản lý và theo dõi trạng thái đơn hàng của bạn</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginTop: 30 }}>
            {[
                { label: "Tổng đơn", val: stats.total, icon: ShoppingBag, color: "#64748b" },
                { label: "Đang xử lý", val: stats.processing, icon: Truck, color: "#3b82f6" },
                { label: "Hoàn thành", val: stats.delivered, icon: CheckCircle2, color: "#22c55e" },
                { label: "Tổng chi tiêu", val: formatCurrency(stats.spent), icon: Package, color: "#f59e0b" } // Icon Package đại diện
            ].map((st, idx) => (
                <div key={idx} style={{ background: "#f8fafc", padding: 20, borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                        <st.icon size={24} color={st.color} />
                    </div>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{st.val}</div>
                        <div style={{ fontSize: 13, color: "#64748b" }}>{st.label}</div>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* FILTERS & LIST */}
      <section className="container" style={{ marginTop: 30 }}>
        {/* Toolbar */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 250 }}>
                <Search size={18} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input 
                    placeholder="Tìm theo Mã đơn hoặc Giá tiền..." 
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: 8, border: "1px solid #cbd5e1", outline: "none" }}
                />
            </div>
            <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                style={{ padding: "0 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", minWidth: 150, height: 42 }}
            >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý (Pending)</option>
                <option value="processing">Đang đóng gói (Processing)</option>
                <option value="shipped">Đang giao (Shipped)</option>
                <option value="delivered">Đã giao (Delivered)</option>
            </select>
        </div>

        {/* Loading State */}
        {loading && <div style={{ textAlign: "center", padding: 40 }}>Đang tải danh sách đơn hàng...</div>}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
             <div style={{ background: "#fff", borderRadius: 12, padding: 60, textAlign: "center", border: "1px solid #e2e8f0" }}>
                <Package size={64} color="#cbd5e1" style={{ margin: "0 auto 20px" }} />
                <h3>Không tìm thấy đơn hàng nào</h3>
                <p className="muted" style={{ marginBottom: 20 }}>Bạn chưa có đơn hàng nào hoặc không tìm thấy kết quả phù hợp.</p>
                <Link to="/" className="btn btn-primary">Mua sắm ngay</Link>
             </div>
        )}

        {/* Order Cards List */}
        <div style={{ display: "grid", gap: 20 }}>
            {filteredOrders.map(order => {
                const statusCfg = getStatusConfig(order.status);
                const StatusIcon = statusCfg.icon;
                const items = order.items || order.order_items || []; // Fallback an toàn
                
                return (
                    <div key={order.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", transition: "box-shadow 0.2s" }} className="hover-shadow">
                        {/* Card Header */}
                        <div style={{ padding: "16px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                <div>
                                    <span style={{ fontSize: 13, color: "#64748b", display: "block" }}>MÃ ĐƠN HÀNG</span>
                                    <span style={{ fontWeight: 600 }}>#{order.id}</span>
                                </div>
                                <div>
                                    <span style={{ fontSize: 13, color: "#64748b", display: "block" }}>NGÀY ĐẶT</span>
                                    <span style={{ fontWeight: 500 }}>{formatDate(order.created_at)}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontWeight: 700, fontSize: 16 }}>{formatCurrency(order.total_amount)}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, background: statusCfg.bg, color: statusCfg.color, padding: "4px 10px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                                    <StatusIcon size={14} />
                                    {statusCfg.text}
                                </div>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div style={{ padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                             {/* Hiển thị item đầu tiên hoặc list items */}
                             <div style={{ flex: 1 }}>
                                {items.length > 0 ? (
                                    items.map((item, idx) => (
                                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: idx === items.length -1 ? 0 : 12 }}>
                                            <div style={{ width: 50, height: 50, background: "#f1f5f9", borderRadius: 6, overflow: "hidden" }}>
                                                {/* Nếu item có ảnh thì hiện, ko thì hiện placeholder */}
                                                <img 
                                                    src={item.image || item.image_url || "https://placehold.co/50"} 
                                                    alt={item.name} 
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    onError={(e) => e.target.src = "https://placehold.co/50?text=..."}
                                                />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: 14 }}>{item.product_name || item.name}</div>
                                                <div style={{ fontSize: 13, color: "#64748b" }}>
                                                    Qty: {item.quantity} x {formatCurrency(item.price)}
                                                    {item.size && ` | Size: ${item.size}`}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="muted">Không có thông tin sản phẩm</p>
                                )}
                             </div>

                             {/* Action Button */}
                             <div style={{ textAlign: "right" }}>
                                <button 
                                    onClick={() => navigate(`/orders/${order.id}`)} // Route chi tiết đơn hàng
                                    className="btn btn-outline"
                                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px" }}
                                >
                                    Chi tiết <ArrowRight size={16} />
                                </button>
                             </div>
                        </div>
                    </div>
                )
            })}
        </div>
      </section>
    </div>
  );
}