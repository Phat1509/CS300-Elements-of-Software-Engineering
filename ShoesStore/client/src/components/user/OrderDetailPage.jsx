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

export default function OrderDetailPage() {
  const navigate = useNavigate();

  // MOCK user (match db.json + ProductDetail mock)
  const userId = 2;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
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
        // json-server: orders có field user_id :contentReference[oaicite:2]{index=2}
        let list = await fetchJson(`${API_BASE}/orders?user_id=${userId}`);

        // fallback nếu backend dùng key khác (cho chắc)
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
  }, []);

  const sorted = useMemo(() => {
    const arr = [...(orders || [])];
    // sort mới nhất trước: created_at ISO string trong db generator :contentReference[oaicite:3]{index=3}
    return arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [orders]);

  const openOrder = (o) => {
    // Route của m: /orders/:id :contentReference[oaicite:4]{index=4}
    // Ưu tiên order_id (numeric) để khớp tracking page fetch theo order_id
    const id = o?.order_id ?? o?.id;
    if (id == null) return;
    navigate(`/orders/${id}`);
  };

  return (
    <main className="men-wrap">
      {/* Breadcrumb */}
      <section className="men-bc">
        <div className="container">
          <Link to="/" className="men-bc-link">
            Home
          </Link>
          <span className="men-bc-sep">›</span>
          <span>Orders</span>
        </div>
      </section>

      {/* Header */}
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">My Orders</h1>
          <p className="men-sub">Tổng hợp tất cả đơn hàng của bạn ở đây nha.</p>
        </div>
      </section>

      <section className="container" style={{ padding: "18px 0 64px" }}>
        {loading ? (
          <p className="muted">Đang load đơn hàng...</p>
        ) : err ? (
          <div
            style={{
              border: "1px solid #fee2e2",
              background: "#fff1f2",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <strong>Oops:</strong> <span>{err}</span>
          </div>
        ) : sorted.length === 0 ? (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 24,
              textAlign: "center",
              background: "#f8fafc",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Chưa có đơn nào</h3>
            <p className="muted" style={{ marginTop: 6, marginBottom: 16 }}>
              Checkout thử 1 đơn rồi quay lại đây sẽ thấy liền.
            </p>
            <Link to="/" className="btn btn-primary">
              Go shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sorted.map((o) => {
              const code = o?.order_id ?? o?.id;
              return (
                <button
                  key={code}
                  onClick={() => openOrder(o)}
                  type="button"
                  className="card"
                  style={{
                    textAlign: "left",
                    padding: 16,
                    cursor: "pointer",
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div className="muted" style={{ fontSize: 13 }}>
                        Order
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>
                        #{code}
                      </div>

                      <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                        Created: {formatDate(o?.created_at || o?.createdAt)}
                      </div>

                      <div className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                        Payment: <strong>{o?.payment || "—"}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "6px 10px",
                          borderRadius: 999,
                          border: "1px solid #e5e7eb",
                          background: "#f8fafc",
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {statusLabel(o?.status)}
                      </div>

                      <div style={{ marginTop: 10, fontWeight: 900, fontSize: 16 }}>
                        {formatMoneyVND(o?.total_amount)}
                      </div>

                      <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                        Tap to track →
                      </div>
                    </div>
                  </div>

                  {o?.shipping_address ? (
                    <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                      Ship to: {o.shipping_address}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
