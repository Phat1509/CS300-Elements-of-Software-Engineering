// client/src/components/user/OrderDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  import.meta?.env?.VITE_API_URL ||
  "http://localhost:3001";

function formatMoneyVND(n) {
  const num = Number(n) || 0;
  return num.toLocaleString("vi-VN") + "₫";
}

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("vi-VN");
}

function statusLabel(status) {
  const s = (status || "").toUpperCase();
  if (s === "PENDING") return "Pending";
  if (s === "PAID") return "Paid";
  if (s === "SHIPPED") return "Shipped";
  if (s === "DELIVERED") return "Delivered";
  if (s === "PLACED") return "Placed";
  return status || "Pending";
}

export default function OrderHistoryPage() {
  const navigate = useNavigate();

  // --- SỬA LỖI TẠI ĐÂY: Lấy user thật từ localStorage ---
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? (user.id || user.user_id) : null;
  // -----------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Nếu chưa đăng nhập thì không fetch
    if (!userId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchJson(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      return res.json();
    }

    async function load() {
      setLoading(true);
      setErr("");

      try {
        // Fetch order theo userId động
        let list = await fetchJson(`${API_BASE}/orders?user_id=${userId}`);

        // Fallback: Nếu backend dùng key 'userId' (camelCase) thay vì 'user_id'
        if (!Array.isArray(list) || list.length === 0) {
          try {
            list = await fetchJson(`${API_BASE}/orders?userId=${userId}`);
          } catch {
            // ignore
          }
        }

        if (!mounted) return;
        setOrders(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Có lỗi khi load orders");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [userId]); // Chạy lại khi userId thay đổi

  const sorted = useMemo(() => {
    const arr = [...(orders || [])];
    // Sắp xếp mới nhất lên đầu
    return arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [orders]);

  const openOrder = (o) => {
    const id = o.id || o.order_id;
    if (id == null) return;
    navigate(`/orders/${id}`);
};

  // --- UI KHI CHƯA LOGIN ---
  if (!user) {
    return (
      <main className="men-wrap">
        <section className="container" style={{ padding: "60px 0", textAlign: "center" }}>
          <h3>Vui lòng đăng nhập</h3>
          <p className="muted">Bạn cần đăng nhập để xem lịch sử đơn hàng.</p>
          <Link to="/login" className="btn btn-primary">Đăng nhập ngay</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="men-wrap">
      {/* Breadcrumb */}
      <section className="men-bc">
        <div className="container">
          <Link to="/" className="men-bc-link">Home</Link>
          <span className="men-bc-sep">›</span>
          <span>Orders</span>
        </div>
      </section>

      {/* Header */}
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">My Orders</h1>
          <p className="men-sub">Xin chào {user.name || user.username}, đây là các đơn hàng của bạn.</p>
        </div>
      </section>

      <section className="container" style={{ padding: "18px 0 64px" }}>
        {loading ? (
          <p className="muted">Đang load đơn hàng...</p>
        ) : err ? (
          <div style={{ border: "1px solid #fee2e2", background: "#fff1f2", borderRadius: 12, padding: 16 }}>
            <strong>Oops:</strong> <span>{err}</span>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, textAlign: "center", background: "#f8fafc" }}>
            <h3 style={{ marginTop: 0 }}>Chưa có đơn nào</h3>
            <p className="muted" style={{ marginTop: 6, marginBottom: 16 }}>
              Checkout thử 1 đơn rồi quay lại đây sẽ thấy liền.
            </p>
            <Link to="/" className="btn btn-primary">Go shopping</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sorted.map((o) => {
              // Hiển thị ID ưu tiên order_id cho đẹp nếu có
              const displayId = o.order_id || o.id; 
              return (
                <button
                  key={o.id}
                  onClick={() => openOrder(o)}
                  type="button"
                  className="card"
                  style={{ textAlign: "left", padding: 16, cursor: "pointer", background: "#fff", border: "1px solid #ddd", borderRadius: 8, width: "100%" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                      <div className="muted" style={{ fontSize: 13 }}>Order ID</div>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>#{displayId}</div>
                      <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                        Created: {formatDate(o?.created_at || o?.createdAt)}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", padding: "6px 10px", borderRadius: 999,
                        border: "1px solid #e5e7eb", background: "#f8fafc", fontWeight: 800, fontSize: 13
                      }}>
                        {statusLabel(o?.status)}
                      </div>
                      <div style={{ marginTop: 10, fontWeight: 900, fontSize: 16, color: "#d9534f" }}>
                        {formatMoneyVND(o?.total_amount)}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}