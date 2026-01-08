// client/src/components/user/OrderHistoryPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Notice from "../common/Notice";
import useNotice from "../../hooks/useNotice";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { getOrders, cancelOrder } from "../../utilities/api";
import { useAuth } from "../../context/AuthContext"; // Import Auth Context

const formatCurrency = (n) => (Number(n) || 0).toLocaleString("en-US") + "$";

const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusConfig = (status) => {
  const s = String(status || "PENDING").toUpperCase();
  switch (s) {
    case "DELIVERED":
      return {
        text: "Delivered",
        color: "#16a34a",
        bg: "#dcfce7",
        icon: CheckCircle2,
      };
    case "SHIPPED":
      return { text: "Shipped", color: "#2563eb", bg: "#dbeafe", icon: Truck };
    case "PROCESSING":
    case "PAID":
      return {
        text: "Processing",
        color: "#d97706",
        bg: "#fef3c7",
        icon: Package,
      };
    case "CANCELLED":
      return {
        text: "Cancelled",
        color: "#dc2626",
        bg: "#fee2e2",
        icon: Package,
      }; // Thêm trạng thái hủy
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
  const { notice, showNotice } = useNotice();

  // --- LOAD DATA ---
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const list = await getOrders();

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

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  // --- FILTER & SORT ---
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // 1. Sort: Mới nhất lên đầu
    result.sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );

    // 2. Filter theo Search & Status
    if (q || filter !== "all") {
      const lowerQ = q.toLowerCase();
      result = result.filter((o) => {
        const s = String(o.status || "").toUpperCase();

        // Match search text
        const matchText =
          String(o.id).includes(lowerQ) ||
          String(o.total_amount).includes(lowerQ);

        // Match status dropdown
        let matchFilter = true;
        if (filter === "pending")
          matchFilter = s === "PENDING" || s === "PLACED";
        if (filter === "processing")
          matchFilter = s === "PROCESSING" || s === "PAID";
        if (filter === "shipped") matchFilter = s === "SHIPPED";
        if (filter === "delivered") matchFilter = s === "DELIVERED";

        return matchText && matchFilter;
      });
    }
    return result;
  }, [orders, q, filter]);

  // --- HANDLE ACTIONS ---
  // --- HANDLE CANCEL ---
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

    try {
      await cancelOrder(orderId);
      // Cập nhật lại state UI ngay lập tức
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o))
      );
      showNotice("success", "Order cancelled successfully.");
    } catch (error) {
      console.error(error);
      showNotice(
        "error",
        "Unable to cancel the order. It may have been processed."
      );
    }
  };
  // --- STATS ---
  const stats = useMemo(() => {
    return {
      total: orders.length,
      delivered: orders.filter(
        (o) => String(o.status).toUpperCase() === "DELIVERED"
      ).length,
      processing: orders.filter((o) =>
        ["PENDING", "PAID", "PROCESSING", "SHIPPED"].includes(
          String(o.status).toUpperCase()
        )
      ).length,
      spent: orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0),
    };
  }, [orders]);

  // --- UI: NOT LOGGED IN ---
  if (!isAuthenticated && !loading) {
    return (
      <div
        className="container"
        style={{ padding: "80px 0", textAlign: "center" }}
      >
        <h3>Please sign in</h3>
        <p className="muted">You need to sign in to view your order history.</p>
        <Link
          to="/login"
          className="btn btn-primary"
          style={{ marginTop: 20, display: "inline-block" }}
        >
          Sign in now
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: 60 }}
    >
      {/* HEADER & STATS */}
      <section
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "40px 0",
        }}
      >
        <div className="container">
          {notice && <Notice type={notice.type} message={notice.message} />}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <div>
              <h1 style={{ margin: "0 0 8px", fontSize: "28px" }}>
                Order History
              </h1>
              <p className="muted" style={{ margin: 0 }}>
                Manage and track the status of your orders
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
              marginTop: 30,
            }}
          >
            {[
              {
                label: "Total Orders",
                val: stats.total,
                icon: ShoppingBag,
                color: "#64748b",
              },
              {
                label: "Processing",
                val: stats.processing,
                icon: Truck,
                color: "#3b82f6",
              },
              {
                label: "Delivered",
                val: stats.delivered,
                icon: CheckCircle2,
                color: "#22c55e",
              },
              {
                label: "Total Spent",
                val: formatCurrency(stats.spent),
                icon: Package,
                color: "#f59e0b",
              }, // Icon Package đại diện
            ].map((st, idx) => (
              <div
                key={idx}
                style={{
                  background: "#f8fafc",
                  padding: 20,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <st.icon size={24} color={st.color} />
                </div>
                <div>
                  <div
                    style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}
                  >
                    {st.val}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    {st.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FILTERS & LIST */}
      <section className="container" style={{ marginTop: 30 }}>
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 250 }}>
            <Search
              size={18}
              color="#94a3b8"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              placeholder="Search by Order ID or Price..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 10px 10px 38px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                outline: "none",
              }}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "0 16px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: "#fff",
              minWidth: 150,
              height: 42,
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: 40 }}>
            Loading your orders...
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 60,
              textAlign: "center",
              border: "1px solid #e2e8f0",
            }}
          >
            <Package
              size={64}
              color="#cbd5e1"
              style={{ margin: "0 auto 20px" }}
            />
            <h3>No orders found</h3>
            <p className="muted" style={{ marginBottom: 20 }}>
              You don't have any orders yet or no matching results were found.
            </p>
            <Link to="/" className="btn btn-primary">
              Start shopping
            </Link>
          </div>
        )}

        {/* Order Cards List */}
        <div style={{ display: "grid", gap: 20 }}>
          {filteredOrders.map((order) => {
            const statusCfg = getStatusConfig(order.status);
            const StatusIcon = statusCfg.icon;
            const items = order.items || order.order_items || []; // Fallback an toàn

            return (
              <div
                key={order.id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s",
                }}
                className="hover-shadow"
              >
                {/* Card Header */}
                <div
                  style={{
                    padding: "16px 24px",
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 16, alignItems: "center" }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          display: "block",
                        }}
                      >
                         Order ID
                      </span>
                      <span style={{ fontWeight: 600 }}>#{order.id}</span>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          display: "block",
                        }}
                      >
                         Order ID Date
                      </span>
                      <span style={{ fontWeight: 500 }}>
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 16 }}>
                      {formatCurrency(order.total_amount)}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: statusCfg.bg,
                        color: statusCfg.color,
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      <StatusIcon size={14} />
                      {statusCfg.text}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div
                  style={{
                    padding: 24,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 20,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    {items.length > 0 ? (
                      items.map((item, idx) => {
                        // ✅ TRÍCH XUẤT DỮ LIỆU ĐÚNG TỪ CẤU TRÚC RUST
                        const product = item.product || {};
                        const variant = item.product_variant || {};
                        // item.price và item.quantity lấy trực tiếp vì đã được flatten từ order_items

                        return (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              marginBottom: 12,
                            }}
                          >
                            <div
                              style={{
                                width: 50,
                                height: 50,
                                background: "#f1f5f9",
                                borderRadius: 6,
                                overflow: "hidden",
                              }}
                            >
                              <img
                                // SỬA: Lấy ảnh từ item.product.image_url
                                src={
                                  product.image_url || "https://placehold.co/50"
                                }
                                alt={product.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) =>
                                  (e.target.src =
                                    "https://placehold.co/50?text=...")
                                }
                              />
                            </div>
                            <div>
                              {/* SỬA: Lấy tên từ item.product.name */}
                              <div style={{ fontWeight: 500, fontSize: 14 }}>
                                {product.name || "Sản phẩm không tồn tại"}
                              </div>
                              <div style={{ fontSize: 13, color: "#64748b" }}>
                                Qty: {item.quantity} x{" "}
                                {formatCurrency(item.price)}
                                {variant.size && ` | Size: ${variant.size}`}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="muted">No product information</p>
                    )}
                  </div>

                  {/* Action Button */}
                  <div style={{ textAlign: "right" }}>
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)} // Route chi tiết đơn hàng
                      className="btn btn-outline"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 16px",
                      }}
                    >
                      View Details<ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
