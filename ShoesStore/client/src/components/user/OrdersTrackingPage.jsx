import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

/**
 * OrderTrackingPage
 * - Works with json-server style:
 *   GET /orders/:id (id is json-server string)
 *   OR GET /orders?order_id=:num (order_id numeric)
 *   GET /order_item?order_id=:order_id
 *   GET /product_variants?variant_id=:id
 *   GET /products?product_id=:id
 */

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
  // fallback (CartPage payload có thể là "Placed")
  if (s === "PLACED") return "Placed";
  return status || "Pending";
}

function statusStepIndex(status) {
  const s = (status || "").toUpperCase();
  // map theo db generateDb.js: PENDING -> PAID -> SHIPPED -> DELIVERED
  if (s === "PENDING" || s === "PLACED") return 0;
  if (s === "PAID") return 1;
  if (s === "SHIPPED") return 2;
  if (s === "DELIVERED") return 3;
  return 0;
}

export default function OrdersTrackingPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]); // enriched items

  useEffect(() => {
    let mounted = true;

    async function fetchJson(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      return res.json();
    }

    async function fetchOrder() {
      setLoading(true);
      setErr("");
      setOrder(null);
      setItems([]);

      try {
        // 1) Try /orders/:id (json-server id string)
        let ord = null;

        try {
          ord = await fetchJson(`${API_BASE}/orders/${encodeURIComponent(id)}`);
        } catch {
          ord = null;
        }

        // 2) If not found, try query by order_id (numeric)
        if (!ord || !ord.order_id) {
          const maybeNum = Number(id);
          if (!Number.isNaN(maybeNum)) {
            const list = await fetchJson(
              `${API_BASE}/orders?order_id=${maybeNum}`
            );
            ord = Array.isArray(list) ? list[0] : null;
          }
        }

        // 3) If still not found, bail
        if (!ord) throw new Error("Không tìm thấy đơn hàng này 😵");

        if (!mounted) return;
        setOrder(ord);

        // Fetch order items by order_id (numeric)
        const orderIdNum = ord.order_id ?? Number(id);
        const rawItems = await fetchJson(
          `${API_BASE}/order_item?order_id=${orderIdNum}`
        );

        // Enrich: variant -> product
        const enriched = await Promise.all(
          (rawItems || []).map(async (it) => {
            let variant = null;
            let product = null;

            try {
              const vList = await fetchJson(
                `${API_BASE}/product_variants?variant_id=${it.variant_id}`
              );
              variant = Array.isArray(vList) ? vList[0] : null;
            } catch {}

            try {
              const productId = variant?.product_id;
              if (productId) {
                const pList = await fetchJson(
                  `${API_BASE}/products?product_id=${productId}`
                );
                product = Array.isArray(pList) ? pList[0] : null;
              }
            } catch {}

            const name = product?.name || `Variant #${it.variant_id}`;
            const image = product?.image_url
              ? product.image_url.startsWith("http")
                ? product.image_url
                : product.image_url
              : "";

            return {
              ...it,
              name,
              image,
              size: variant?.size || "-",
              color: variant?.color || "-",
              lineTotal: (Number(it.price) || 0) * (Number(it.quantity) || 0),
            };
          })
        );

        if (!mounted) return;
        setItems(enriched || []);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Có lỗi xảy ra");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    fetchOrder();

    return () => {
      mounted = false;
    };
  }, [id]);

  const stepIdx = useMemo(() => statusStepIndex(order?.status), [order?.status]);

  const computedTotal = useMemo(() => {
    // ưu tiên total_amount từ order (db.json có)
    if (order?.total_amount != null) return Number(order.total_amount) || 0;
    // fallback: sum items
    return (items || []).reduce((acc, it) => acc + (it.lineTotal || 0), 0);
  }, [order, items]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Copy link tracking xong rồi nè ✅");
    } catch {
      alert("Copy không được (browser chặn). M tự copy URL trên thanh địa chỉ nha.");
    }
  };

  if (loading) {
    return (
      <main className="men-wrap">
        <section className="container" style={{ padding: "28px 0 60px" }}>
          <h1 className="men-title" style={{ marginBottom: 8 }}>
            Order Tracking
          </h1>
          <p className="muted">Đang load đơn hàng...</p>
        </section>
      </main>
    );
  }

  if (err) {
    return (
      <main className="men-wrap">
        <section className="container" style={{ padding: "28px 0 60px" }}>
          <h1 className="men-title" style={{ marginBottom: 8 }}>
            Order Tracking
          </h1>
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

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
            <Link to="/cart" className="btn btn-outline">
              Back to Cart
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="men-wrap">
      {/* Breadcrumb */}
      <section className="men-bc">
        <div className="container">
          <Link to="/" className="men-bc-link">
            Home
          </Link>
          <span className="men-bc-sep">›</span>
          <Link to="/orders" className="men-bc-link">
            Orders
          </Link>
          <span className="men-bc-sep">›</span>
          <span>Tracking</span>
        </div>
      </section>

      {/* Header */}
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Order Tracking</h1>
          <p className="men-sub">
            Theo dõi đơn hàng của bạn theo thời gian thực-ish 😎
          </p>
        </div>
      </section>

      <section className="container" style={{ padding: "18px 0 64px" }}>
        {/* Top card */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            background: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div className="muted" style={{ fontSize: 13 }}>
                Order
              </div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>
                #{order?.order_id ?? order?.id ?? id}
              </div>
              <div className="muted" style={{ marginTop: 6 }}>
                Created: {formatDate(order?.created_at || order?.createdAt)}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "1px solid #e5e7eb",
                  background: "#f8fafc",
                  fontWeight: 700,
                }}
              >
                Status: {statusLabel(order?.status)}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="btn btn-outline" onClick={copyLink} type="button">
                  Copy tracking link
                </button>
                <Link to="/orders" className="btn btn-outline">
                  View all orders
                </Link>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ marginTop: 18 }}>
            {["Placed", "Paid", "Shipped", "Delivered"].map((label, idx) => {
              const done = idx <= stepIdx;
              return (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 10,
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 999,
                      border: "2px solid #111827",
                      background: done ? "#111827" : "transparent",
                      flex: "0 0 auto",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{label}</div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      {idx === stepIdx ? "Đang ở bước này nè" : done ? "Đã xong" : "Chưa tới"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items + summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 16,
            marginTop: 16,
          }}
        >
          {/* Items */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              background: "#fff",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Items</h3>

            {items.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                Đơn này chưa có item (hoặc data chưa map đúng).
              </p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {items.map((it) => (
                  <div
                    key={it.id || `${it.variant_id}-${it.order_id}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "72px 1fr auto",
                      gap: 12,
                      alignItems: "center",
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 10,
                        overflow: "hidden",
                        background: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {it.image ? (
                        <img
                          src={it.image}
                          alt={it.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span className="muted" style={{ fontSize: 12 }}>
                          No image
                        </span>
                      )}
                    </div>

                    <div>
                      <div style={{ fontWeight: 800 }}>{it.name}</div>
                      <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                        Variant: {it.size} / {it.color} · Qty: {it.quantity}
                      </div>
                      <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                        Price: {formatMoneyVND(it.price)}
                      </div>
                    </div>

                    <div style={{ fontWeight: 900 }}>
                      {formatMoneyVND(it.lineTotal)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              background: "#fff",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Summary</h3>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Payment</span>
                <span style={{ fontWeight: 700 }}>{order?.payment || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Shipping address</span>
                <span style={{ fontWeight: 700 }}>
                  {order?.shipping_address || "—"}
                </span>
              </div>

              <hr />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 900,
                  fontSize: 18,
                }}
              >
                <span>Total</span>
                <span>{formatMoneyVND(computedTotal)}</span>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <Link to="/" className="btn btn-primary">
                  Continue shopping
                </Link>
                <Link to="/cart" className="btn btn-outline">
                  Back to cart
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tiny note */}
        <p className="muted" style={{ marginTop: 14, fontSize: 12 }}>
          Nếu m đang chạy json-server: nhớ bật đúng port (default mình set {API_BASE}).
          Cần đổi thì set env: <code>REACT_APP_API_URL</code> hoặc <code>VITE_API_URL</code>.
        </p>
      </section>
    </main>
  );
}
