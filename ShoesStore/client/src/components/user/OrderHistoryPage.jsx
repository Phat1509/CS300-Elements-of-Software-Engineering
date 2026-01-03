import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Star,
} from "lucide-react";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  import.meta?.env?.VITE_API_URL ||
  "http://localhost:3001";

const moneyVND = (n) => (Number(n) || 0).toLocaleString("vi-VN") + "₫";
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString("vi-VN") : "-");

function normalizeStatus(raw) {
  const s = String(raw || "PENDING").toUpperCase();
  if (s === "PLACED") return "PENDING";
  return s;
}

function statusText(s) {
  const x = normalizeStatus(s);
  if (x === "PENDING") return "Pending";
  if (x === "PAID") return "Paid";
  if (x === "PROCESSING") return "Processing";
  if (x === "SHIPPED") return "Shipped";
  if (x === "DELIVERED") return "Delivered";
  return "Pending";
}

function statusPillClass(s) {
  const x = normalizeStatus(s);
  if (x === "DELIVERED") return "delivered";
  if (x === "SHIPPED") return "shipped";
  if (x === "PROCESSING" || x === "PAID") return "processing";
  return "pending";
}

function statusIcon(s) {
  const x = normalizeStatus(s);
  if (x === "DELIVERED") return CheckCircle2;
  if (x === "SHIPPED") return Truck;
  if (x === "PROCESSING" || x === "PAID") return Package;
  return Clock;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user.id || user.user_id : null;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [orders, setOrders] = useState([]);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        let list = await fetchJson(`${API_BASE}/orders?user_id=${userId}`);
        if (!Array.isArray(list) || list.length === 0) {
          try {
            list = await fetchJson(`${API_BASE}/orders?userId=${userId}`);
          } catch {}
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
    })();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const sorted = useMemo(() => {
    const arr = [...orders];
    return arr.sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
  }, [orders]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return sorted.filter((o) => {
      const id = String(o.order_id || o.id || "").toLowerCase();
      const st = statusText(o.status).toLowerCase();
      const total = String(o.total_amount || "").toLowerCase();

      const matchText =
        !text || id.includes(text) || st.includes(text) || total.includes(text);

      const s = normalizeStatus(o.status);
      const matchFilter =
        filter === "all" ||
        (filter === "pending" && s === "PENDING") ||
        (filter === "processing" && (s === "PROCESSING" || s === "PAID")) ||
        (filter === "shipped" && s === "SHIPPED") ||
        (filter === "delivered" && s === "DELIVERED");

      return matchText && matchFilter;
    });
  }, [sorted, q, filter]);

  const stats = useMemo(() => {
    const all = sorted;
    const delivered = all.filter(
      (o) => normalizeStatus(o.status) === "DELIVERED"
    ).length;
    const inProgress = all.filter((o) =>
      ["PENDING", "PROCESSING", "PAID", "SHIPPED"].includes(
        normalizeStatus(o.status)
      )
    ).length;
    const totalSpent = all.reduce(
      (sum, o) => sum + (Number(o.total_amount) || 0),
      0
    );

    return {
      total: all.length,
      delivered,
      inProgress,
      totalSpent,
    };
  }, [sorted]);

  if (!user) {
    return (
      <main className="men-wrap">
        <section className="container" style={{ padding: "70px 0", textAlign: "center" }}>
          <h3>Vui lòng đăng nhập</h3>
          <p className="muted">Bạn cần đăng nhập để xem lịch sử đơn hàng.</p>
          <Link to="/signin" className="btn btn-primary">
            Đăng nhập ngay
          </Link>
        </section>
      </main>
    );
  }

  return (
    <>
      {/* HERO */}
      <section className="orders-hero">
        <div className="container orders-hero-inner">
          <h1 className="orders-hero-title">My Orders</h1>
          <p className="orders-hero-sub">
            Track and manage all your orders in one place
          </p>

          <div className="orders-stats">
            <div className="orders-stat">
              <Package size={22} />
              <div className="val">{stats.total}</div>
              <div className="label">Total Orders</div>
            </div>
            <div className="orders-stat">
              <CheckCircle2 size={22} />
              <div className="val">{stats.delivered}</div>
              <div className="label">Delivered</div>
            </div>
            <div className="orders-stat">
              <Truck size={22} />
              <div className="val">{stats.inProgress}</div>
              <div className="label">In Progress</div>
            </div>
            <div className="orders-stat">
              <Star size={22} />
              <div className="val">{moneyVND(stats.totalSpent)}</div>
              <div className="label">Total Spent</div>
            </div>
          </div>

          <div className="orders-searchbox">
            <div className="orders-search-row">
              <div className="orders-search-input">
                <Search size={18} color="#94a3b8" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by order ID..."
                />
              </div>

              <div className="orders-filter">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIST */}
      <section className="orders-list-area">
        <div className="container">
          <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 14 }}>
            {loading ? (
              <div className="orders-card" style={{ padding: 18 }}>
                <p className="muted">Đang load đơn hàng...</p>
              </div>
            ) : err ? (
              <div className="orders-card" style={{ padding: 18 }}>
                <strong>Oops:</strong> {err}
              </div>
            ) : filtered.length === 0 ? (
              <div className="orders-card" style={{ padding: 22, textAlign: "center" }}>
                <h3>No orders found</h3>
                <Link to="/" className="btn btn-primary">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              filtered.map((o) => {
                const oid = o.order_id ?? o.id;
                const pill = statusPillClass(o.status);
                const Icon = statusIcon(o.status);

                return (
                  <div className="orders-card" key={oid}>
                    <div className="order-head">
                      <div className="order-left">
                        <div className="order-iconbox">
                          <Icon size={20} />
                        </div>

                        <div>
                          <div className="order-title-row">
                            <p className="order-id">#{oid}</p>
                            <span className={`pill ${pill}`}>
                              <span className="dot" />
                              {statusText(o.status)}
                            </span>
                          </div>

                          <div className="order-meta">
                            <span>🗓 {fmtDate(o.created_at || o.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="order-right">
                        <div className="small">Total Amount</div>
                        <div className="total">
                          {moneyVND(o.total_amount)}
                        </div>
                        <button
                          className="btn-solid"
                          style={{ marginTop: 10 }}
                          onClick={() => navigate(`/orders/${oid}`)}
                        >
                          Track →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
}
