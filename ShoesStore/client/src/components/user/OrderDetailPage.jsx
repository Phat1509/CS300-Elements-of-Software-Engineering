import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Truck, MapPin, ReceiptText, Star, RotateCcw } from "lucide-react";
import { getOrderDetail, getOrderItems } from "../../utilities/api";
function formatMoneyVND(n) {
  const num = Number(n) || 0;
  return num.toLocaleString("vi-VN") + "đ";
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("vi-VN");
}

function normalizeStatus(s) {
  const v = String(s || "").toLowerCase();
  if (v.includes("deliver")) return "DELIVERED";
  if (v.includes("ship")) return "SHIPPED";
  if (v.includes("process")) return "PROCESSING";
  if (v.includes("paid")) return "PAID";
  if (v.includes("pend")) return "PENDING";
  return v ? v.toUpperCase() : "PENDING";
}

function statusLabel(s) {
  const v = normalizeStatus(s);
  if (v === "DELIVERED") return "Delivered";
  if (v === "SHIPPED") return "Shipped";
  if (v === "PROCESSING") return "Processing";
  if (v === "PAID") return "Paid";
  return "Pending";
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  // fetch order + items (giữ logic cũ của bạn)
  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);
      setErr("");
      try {
        
        const [orderJson, itemsJson] = await Promise.all([
            getOrderDetail(id),       
            getOrderItems(id)         
        ]);

        if (!alive) return;
        setOrder(orderJson);
        setItems(Array.isArray(itemsJson) ? itemsJson.map((x) => ({
          id: x.id ?? x.order_item_id,
          name: x.product_name ?? x.name ?? "Sneaker",
          image: x.image_url ?? x.image ?? "https://via.placeholder.com/150",
          qty: Number(x.quantity ?? x.qty ?? 1),
          size: x.size ?? x.variant_size ?? x.shoe_size ?? "",
          price: Number(x.unit_price ?? x.price ?? 0),
          variant_id: x.variant_id ?? x.product_variant_id ?? "",
        })) : []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Something went wrong");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [id]);

  const subtotal = useMemo(() => {
    if (!items?.length) return 0;
    return items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
  }, [items]);

  const shipping = useMemo(() => {
    const v = order?.shipping_fee ?? order?.shippingFee ?? 0;
    return Number(v) || 0;
  }, [order]);

  const tax = useMemo(() => {
    const v = order?.tax ?? order?.vat ?? 0;
    return Number(v) || 0;
  }, [order]);

  const total = useMemo(() => {
    if (order?.total_amount != null) return Number(order.total_amount) || 0;
    return subtotal + shipping + tax;
  }, [order, subtotal, shipping, tax]);

  const trackingCode =
    order?.tracking_code || order?.trackingCode || order?.tracking_number || order?.trackingNumber || "";

  const displayId = order?.order_id ?? order?.id ?? id;

  // ===== Leave Review (no backend): stored in localStorage by order id =====
  const reviewStorageKey = useMemo(() => `stepstyle_review_${String(displayId)}`, [displayId]);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [savedReview, setSavedReview] = useState(null); // { rating, text, savedAt }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(reviewStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setSavedReview(parsed);
        setRating(Number(parsed.rating) || 0);
        setReviewText(parsed.text || "");
      }
    } catch {
      // ignore bad storage
    }
  }, [reviewStorageKey]);

  const openReview = () => setIsReviewOpen(true);
  const closeReview = () => setIsReviewOpen(false);

  const saveReview = () => {
    const payload = {
      rating: Math.max(1, Math.min(5, Number(rating) || 0)),
      text: (reviewText || "").trim(),
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(reviewStorageKey, JSON.stringify(payload));
    } catch {
      // ignore
    }
    setSavedReview(payload);
    setIsReviewOpen(false);
  };

  const clearReview = () => {
    try {
      localStorage.removeItem(reviewStorageKey);
    } catch {
      // ignore
    }
    setSavedReview(null);
    setRating(0);
    setReviewText("");
    setIsReviewOpen(false);
  };

  const onBuyAgain = () => {
    // tuỳ bạn muốn điều hướng đâu
    nav("/");
  };

  const StatusIcon = CheckCircle2;

  if (loading) {
    return (
      <main style={{ padding: "48px 0" }}>
        <div className="container">
          <div className="od-card" style={{ padding: 24 }}>
            Loading…
          </div>
        </div>
      </main>
    );
  }

  if (err) {
    return (
      <main style={{ padding: "48px 0" }}>
        <div className="container">
          <div className="od-card" style={{ padding: 24 }}>
            <strong>Oops:</strong> {err}
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link to="/orders" className="od-btnGhost">Back to Orders</Link>
              <Link to="/" className="od-btnSolid">Home</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main style={{ padding: "28px 0 60px" }}>
        <div className="container">
          <div className="od-card">
            {/* header */}
            <div className="od-head">
              <div className="od-head-left">
                <div className="od-statusIcon">
                  <StatusIcon size={22} color="#16a34a" />
                </div>

                <div>
                  <div className="od-titleRow">
                    <p className="od-orderId">#{displayId}</p>
                    <span className="od-badge">{statusLabel(order?.status)}</span>
                  </div>

                  <div className="od-meta">
                    <span>🗓 {formatDate(order?.created_at || order?.createdAt)}</span>
                    <span className="dot" />
                    <span>📦 {items.length} items</span>
                  </div>

                  {savedReview?.rating ? (
                    <div className="od-savedReview">
                      <Star size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                      Saved Review: {savedReview.rating}/5
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="od-head-right">
                <div className="small">Total Amount</div>
                <div className="total">{formatMoneyVND(total)}</div>
              </div>
            </div>

            {/* items */}
            <div className="od-section">
              <p className="od-sectionTitle">ORDER ITEMS</p>

              {items.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>
                  Order items will show here when the API is ready.
                </p>
              ) : (
                <div className="od-items">
                  {items.map((it, idx) => (
                    <div className="od-itemRow" key={it.id || `${it.variant_id}-${idx}`}>
                      <div className="od-imgWrap">
                        <img src={it.image} alt={it.name} />
                        <div className="od-qtyBubble">{it.qty}</div>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="od-itemName">{it.name}</div>
                        <div className="muted" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          {!!it.size && <span>Size: {it.size}</span>}
                          <span>Qty: {it.qty}</span>
                        </div>
                      </div>

                      <div className="od-itemPrice">{formatMoneyVND((Number(it.price) || 0) * (Number(it.qty) || 0))}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* address + breakdown */}
            <div className="od-grid2">
              <div className="od-box">
                <div className="od-boxTitle">
                  <MapPin size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
                  SHIPPING ADDRESS
                </div>
                <div className="muted" style={{ marginTop: 10 }}>
                  {order?.shipping_address || order?.address || "—"}
                </div>
              </div>

              <div className="od-box">
                <div className="od-boxTitle">
                  <ReceiptText size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
                  PRICE BREAKDOWN
                </div>
                <div className="od-breakdown">
                  <div className="od-row">
                    <span className="muted">Subtotal</span>
                    <span>{formatMoneyVND(subtotal)}</span>
                  </div>
                  <div className="od-row">
                    <span className="muted">Shipping</span>
                    <span>{formatMoneyVND(shipping)}</span>
                  </div>
                  <div className="od-row">
                    <span className="muted">Tax</span>
                    <span>{formatMoneyVND(tax)}</span>
                  </div>
                  <div className="od-divider" />
                  <div className="od-row od-rowTotal">
                    <span>Total</span>
                    <span>{formatMoneyVND(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* delivered banner */}
            <div className="od-banner">
              <div className="od-bannerLeft">
                <div className="od-bannerIcon">
                  <Truck size={18} color="#16a34a" />
                </div>
                <div>
                  <div style={{ fontWeight: 900, color: "#065f46" }}>
                    {normalizeStatus(order?.status) === "DELIVERED" ? "Delivered on" : "Latest update"}
                  </div>
                  <div style={{ color: "#065f46" }}>
                    <strong>Tracking:</strong>{" "}
                    {trackingCode ? trackingCode : "Not available"}{" "}
                    • {formatDate(order?.updated_at || order?.updatedAt || order?.created_at || order?.createdAt)}
                  </div>
                </div>
              </div>

              <button className="od-btnGhost" type="button">
                Track Package
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal (inline styles so it always looks good) */}
{isReviewOpen && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2,6,23,.55)",
      backdropFilter: "blur(6px)",
      display: "grid",
      placeItems: "center",
      zIndex: 9999,
      padding: 16,
    }}
    onMouseDown={(e) => {
      // click outside to close
      if (e.target === e.currentTarget) closeReview();
    }}
    role="dialog"
    aria-modal="true"
  >
    <div
      style={{
        width: "min(560px, 100%)",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 30px 70px rgba(15,23,42,.25)",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,.08)",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(0,0,0,.06)",
          background: "#f8fafc",
        }}
      >
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, color: "#0f172a" }}>
            Leave a review
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            Order <b>#{String(displayId)}</b>
          </div>
        </div>

        <button
          type="button"
          onClick={closeReview}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,.08)",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 900,
            lineHeight: 1,
          }}
          aria-label="Close"
          title="Close"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: 16 }}>
        {/* Stars */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ minWidth: 64, fontSize: 13, color: "#64748b", fontWeight: 800 }}>
            Rating
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,.08)",
                  background: n <= rating ? "rgba(250,204,21,.25)" : "#fff",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
                aria-label={`${n} star`}
                title={`${n} star`}
              >
                <Star
                  size={18}
                  color={n <= rating ? "#0f172a" : "#94a3b8"}
                  fill={n <= rating ? "#0f172a" : "transparent"}
                />
              </button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", fontSize: 13, color: "#64748b", fontWeight: 800 }}>
            {rating ? `${rating}/5` : "—"}
          </div>
        </div>

        {/* Textarea */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 800, marginBottom: 6 }}>
            Comment
          </div>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            placeholder="Optional… what did you think?"
            style={{
              width: "100%",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,.10)",
              padding: "12px 12px",
              outline: "none",
              fontFamily: "inherit",
              fontSize: 14,
              resize: "vertical",
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "0 0 0 4px rgba(59,130,246,.15)";
              e.currentTarget.style.borderColor = "rgba(59,130,246,.55)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "rgba(0,0,0,.10)";
            }}
          />

          <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
            Saved on this browser only (no backend).
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(0,0,0,.06)",
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          background: "#fff",
        }}
      >
        <button
          type="button"
          onClick={clearReview}
          style={{
            borderRadius: 14,
            padding: "10px 14px",
            fontWeight: 900,
            border: "1px solid rgba(0,0,0,.10)",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Clear
        </button>

        <button
          type="button"
          onClick={closeReview}
          style={{
            borderRadius: 14,
            padding: "10px 14px",
            fontWeight: 900,
            border: "1px solid rgba(0,0,0,.10)",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={saveReview}
          disabled={!rating}
          style={{
            borderRadius: 14,
            padding: "10px 14px",
            fontWeight: 900,
            border: "none",
            background: !rating ? "#94a3b8" : "#0f172a",
            color: "#fff",
            cursor: !rating ? "not-allowed" : "pointer",
          }}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}


      {/* actions bar bottom */}
      <div className="od-actionsBar">
        <div className="container od-actionsInner">
          <Link to="/orders" className="od-btnGhost">
            Back
          </Link>

          <button className="od-btnGhost" type="button" onClick={openReview}>
            <Star size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
            Leave Review
          </button>

          <button className="od-btnSolid" type="button" onClick={onBuyAgain}>
            <RotateCcw size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
            Buy Again
          </button>
        </div>
      </div>
    </>
  );
}