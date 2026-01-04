import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Copy,
  Download,
  MapPin,
  Package,
  RotateCcw,
  Star,
  Truck,
  X,
} from "lucide-react";

import { getOrders } from "../../utilities/api";

function money(n) {
  const v = Number(n || 0);
  return `$${v.toFixed(2)}`;
}

function safeText(v, fallback = "—") {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function normalizeStatus(s) {
  const v = String(s || "").toLowerCase();
  if (v.includes("deliver")) return "DELIVERED";
  if (v.includes("ship")) return "SHIPPED";
  if (v.includes("process")) return "PROCESSING";
  if (v.includes("paid")) return "PAID";
  if (v.includes("pend")) return "PENDING";
  if (v.includes("cancel")) return "CANCELLED";
  return String(s || "PENDING").toUpperCase();
}

function statusMeta(status) {
  const v = normalizeStatus(status);
  switch (v) {
    case "DELIVERED":
      return { label: "Delivered", bg: "rgba(16,185,129,.14)", fg: "#065f46", icon: Package };
    case "SHIPPED":
      return { label: "Shipped", bg: "rgba(59,130,246,.14)", fg: "#1d4ed8", icon: Truck };
    case "PROCESSING":
      return { label: "Processing", bg: "rgba(245,158,11,.14)", fg: "#92400e", icon: Package };
    case "PAID":
      return { label: "Paid", bg: "rgba(34,197,94,.14)", fg: "#166534", icon: Package };
    case "CANCELLED":
      return { label: "Cancelled", bg: "rgba(239,68,68,.14)", fg: "#991b1b", icon: X };
    case "PENDING":
    default:
      return { label: "Pending", bg: "rgba(148,163,184,.20)", fg: "#334155", icon: Package };
  }
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

/** Modal nhỏ để leave rating/comment */
function ReviewModal({
  open,
  onClose,
  rating,
  setRating,
  reviewText,
  setReviewText,
  onSave,
  onClear,
  savedReview,
}) {
  if (!open) return null;

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, .55)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 50,
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
            padding: "16px 16px 14px",
            borderBottom: "1px solid rgba(0,0,0,.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: "#0f172a" }}>
              Leave a review
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              Rate your delivery & product experience.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,.08)",
              background: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
            aria-label="Close"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 16 }}>
          {savedReview ? (
            <div
              style={{
                border: "1px solid rgba(0,0,0,.08)",
                borderRadius: 14,
                padding: 12,
                marginBottom: 12,
                background: "rgba(2,6,23,.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontWeight: 900, color: "#0f172a" }}>Saved review</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {savedReview?.savedAt ? formatDate(savedReview.savedAt) : ""}
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <Star
                      key={n}
                      size={16}
                      color={n <= (savedReview?.rating || 0) ? "#0f172a" : "#cbd5e1"}
                      fill={n <= (savedReview?.rating || 0) ? "#0f172a" : "transparent"}
                    />
                  );
                })}
              </div>

              {savedReview?.text ? (
                <div
                  style={{
                    marginTop: 10,
                    color: "#0f172a",
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,.06)",
                    borderRadius: 12,
                    padding: 12,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {savedReview.text}
                </div>
              ) : null}

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={onClear}
                  style={{
                    borderRadius: 14,
                    padding: "10px 14px",
                    fontWeight: 800,
                    border: "1px solid rgba(0,0,0,.12)",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Remove saved review
                </button>
              </div>
            </div>
          ) : null}

          <div style={{ fontWeight: 900, color: "#0f172a", marginBottom: 8 }}>
            Your rating
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Array.from({ length: 5 }).map((_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  style={{
                    width: 46,
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
              );
            })}
          </div>

          <div style={{ fontWeight: 900, color: "#0f172a", marginTop: 16, marginBottom: 8 }}>
            Comment (optional)
          </div>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell us what you liked (or what we can improve)..."
            style={{
              width: "100%",
              minHeight: 120,
              resize: "vertical",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,.10)",
              padding: 12,
              outline: "none",
              fontSize: 14,
              lineHeight: 1.55,
              boxShadow: "inset 0 1px 0 rgba(15,23,42,.02)",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Tip: Keep it short & honest.
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              {clamp((reviewText || "").length, 0, 2000)}/2000
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 16,
            borderTop: "1px solid rgba(0,0,0,.08)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              borderRadius: 14,
              padding: "10px 14px",
              fontWeight: 800,
              border: "1px solid rgba(0,0,0,.12)",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
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
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  // Note: file CartPage đang lưu user ở localStorage key "user"
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  }, []);

  // fetch orders rồi tìm order theo id param
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const uid = user?.id || user?.user_id;
        if (!uid) {
          setOrder(null);
          setLoading(false);
          return;
        }

        const list = await getOrders(uid);
        const found =
          list.find((o) => String(o.id) === String(id)) ||
          list.find((o) => String(o.order_id) === String(id)) ||
          null;

        setOrder(found);
      } catch (e) {
        console.error("Load order detail error:", e);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, user]);

  const status = useMemo(() => statusMeta(order?.status), [order?.status]);

  const shippingFee = Number(order?.shipping_fee || 0);
  const tax = Number(order?.tax || 0);
  const totalAmount = Number(order?.total_amount || 0);

  const trackingNumber =
    order?.tracking_number || order?.trackingNumber || "";

  const displayId = order?.order_id ?? order?.id ?? id;

  const statusNormalized = useMemo(
    () => normalizeStatus(order?.status),
    [order?.status]
  );
  const canLeaveReview = statusNormalized === "DELIVERED";

  // ===== Leave Review (no backend): stored in localStorage by order id =====
  const reviewStorageKey = useMemo(
    () => `stepstyle_review_${String(displayId)}`,
    [displayId]
  );

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
    } catch (e) {}
  }, [reviewStorageKey]);

  const openReview = () => {
    // ✅ chỉ cho review khi DELIVERED
    if (!canLeaveReview) return;
    setIsReviewOpen(true);
  };
  const closeReview = () => setIsReviewOpen(false);

  const saveReview = () => {
    const payload = {
      rating: Math.max(1, Math.min(5, Number(rating) || 0)),
      text: (reviewText || "").trim(),
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(reviewStorageKey, JSON.stringify(payload));
    setSavedReview(payload);
    setIsReviewOpen(false);
  };

  const clearReview = () => {
    localStorage.removeItem(reviewStorageKey);
    setSavedReview(null);
    setRating(0);
    setReviewText("");
  };

  const onBack = () => navigate(-1);

  const onCopyTracking = async () => {
    if (!trackingNumber) return;
    try {
      await navigator.clipboard.writeText(String(trackingNumber));
      alert("Copied tracking number!");
    } catch (e) {
      alert("Copy failed.");
    }
  };

  const onBuyAgain = () => navigate("/");

  if (loading) {
    return (
      <main className="container" style={{ padding: "80px 0", textAlign: "center" }}>
        <p>Loading order...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container" style={{ padding: "80px 0", textAlign: "center" }}>
        <p className="muted">Please sign in to view your order.</p>
        <Link className="btn btn-primary" to="/signin">
          Sign in
        </Link>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="container" style={{ padding: "80px 0", textAlign: "center" }}>
        <p className="muted">Order not found.</p>
        <button className="btn btn-outline" onClick={onBack}>
          Go back
        </button>
      </main>
    );
  }

  const StatusIcon = status.icon;

  return (
    <>
      {/* Breadcrumb */}
      <section className="men-bc" style={{ borderBottom: "1px solid #e5e7eb" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link to="/" className="men-bc-link">
            Home
          </Link>
          <ChevronRight size={14} className="muted" />
          <Link to="/orders" className="men-bc-link">
            Orders
          </Link>
          <ChevronRight size={14} className="muted" />
          <span style={{ color: "#111", fontWeight: 600 }}>Order #{safeText(displayId)}</span>
        </div>
      </section>

      <main className="container" style={{ padding: "28px 0 70px" }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onBack}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 999,
                background: status.bg,
                color: status.fg,
                fontWeight: 900,
                border: "1px solid rgba(0,0,0,.06)",
              }}
            >
              <StatusIcon size={16} /> {status.label}
            </span>
          </div>
        </div>

        {/* Summary card */}
        <div
          style={{
            marginTop: 18,
            border: "1px solid rgba(0,0,0,.08)",
            borderRadius: 16,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <div
            style={{
              padding: 16,
              background: "linear-gradient(135deg, rgba(15,23,42,.03), rgba(59,130,246,.05))",
              borderBottom: "1px solid rgba(0,0,0,.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 1000, fontSize: 18, color: "#0f172a" }}>
                  Order #{safeText(displayId)}
                </div>
                <div style={{ marginTop: 4, fontSize: 13, color: "#64748b" }}>
                  {statusNormalized === "DELIVERED" ? "Delivered on" : "Latest update"}{" "}
                  <span style={{ color: "#0f172a", fontWeight: 700 }}>
                    {formatDate(order?.updated_at || order?.created_at)}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#64748b" }}>Total</div>
                <div style={{ fontWeight: 1000, fontSize: 22, color: "#0f172a" }}>
                  {money(totalAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: 16 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 14,
              }}
            >
              {/* Shipping */}
              <div
                style={{
                  border: "1px solid rgba(0,0,0,.08)",
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(59,130,246,.10)",
                      border: "1px solid rgba(59,130,246,.18)",
                    }}
                  >
                    <MapPin size={18} color="#1d4ed8" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, color: "#0f172a" }}>Shipping</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      {safeText(order?.customer_note || "Standard Shipping")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking */}
              <div
                style={{
                  border: "1px solid rgba(0,0,0,.08)",
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(16,185,129,.10)",
                      border: "1px solid rgba(16,185,129,.18)",
                    }}
                  >
                    <Truck size={18} color="#065f46" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, color: "#0f172a" }}>Tracking</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      {trackingNumber ? (
                        <span style={{ color: "#0f172a", fontWeight: 800 }}>{trackingNumber}</span>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={onCopyTracking}
                    disabled={!trackingNumber}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 12,
                      opacity: trackingNumber ? 1 : 0.6,
                      cursor: trackingNumber ? "pointer" : "not-allowed",
                    }}
                    title={trackingNumber ? "Copy" : "No tracking yet"}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Payment breakdown */}
              <div
                style={{
                  border: "1px solid rgba(0,0,0,.08)",
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(250,204,21,.14)",
                      border: "1px solid rgba(250,204,21,.22)",
                    }}
                  >
                    <Download size={18} color="#92400e" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, color: "#0f172a" }}>Payment</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      Shipping: <b style={{ color: "#0f172a" }}>{money(shippingFee)}</b> • Tax:{" "}
                      <b style={{ color: "#0f172a" }}>{money(tax)}</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 16,
              }}
            >
              {/* ✅ Leave Review chỉ dành cho DELIVERED */}
              {canLeaveReview && (
                <button className="od-btnGhost" type="button" onClick={openReview}>
                  <Star size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
                  Leave Review
                </button>
              )}

              <button className="od-btnSolid" type="button" onClick={onBuyAgain}>
                <RotateCcw size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
                Buy Again
              </button>
            </div>
          </div>
        </div>
      </main>

      <ReviewModal
        open={isReviewOpen}
        onClose={closeReview}
        rating={rating}
        setRating={setRating}
        reviewText={reviewText}
        setReviewText={setReviewText}
        onSave={saveReview}
        onClear={clearReview}
        savedReview={savedReview}
      />
    </>
  );
}