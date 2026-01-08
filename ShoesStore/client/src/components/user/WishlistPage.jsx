// client/src/components/user/WishlistPage.jsx
import React, { useEffect } from "react";
import Notice from "../common/Notice";
import useNotice from "../../hooks/useNotice";
import { Link } from "react-router-dom";
import { ChevronRight, Heart, X } from "lucide-react";
import ProductCard from "./ProductCard";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlistEntries, wishlistLoading, refreshWishlist, removeFromWishlistByProductId } = useWishlist();

  const { notice, showNotice } = useNotice();

  const userId = user ? (user.id || user.user_id || user.pid) : null;

  // wishlistEntries are already products from the API
  const products = wishlistEntries;

  useEffect(() => {
    if (userId) refreshWishlist(userId);
  }, [userId]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlistByProductId(productId);
      showNotice("success", "Removed from wishlist.");
    } catch (e) {
      console.error("Error removing from wishlist:", e);
      showNotice("error", "Failed to remove item from wishlist. Please try again.");
    }
  };

  const isEmpty = !wishlistLoading && products.length === 0;

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link> <ChevronRight size={16} /> <span>Wishlist</span>
        </div>
      </div>

      <section className="container" style={{ padding: "30px 0 60px" }}>
        {notice && <Notice type={notice.type} message={notice.message} />}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Heart size={22} />
          <h2 style={{ margin: 0 }}>Your Wishlist</h2>
        </div>

        {!userId ? (
          <div className="card" style={{ padding: 18 }}>
            <p style={{ marginTop: 0 }}>
              Please <b>Sign in</b> to view your wishlist.
            </p>
            <Link to="/signin" className="btn btn-primary" style={{ width: "fit-content" }}>
              Go to Sign in
            </Link>
          </div>
        ) : wishlistLoading ? (
          <div className="card" style={{ padding: 18 }}>
            <p style={{ margin: 0 }}>Loading wishlist...</p>
          </div>
        ) : isEmpty ? (
          <div className="card" style={{ padding: 18 }}>
            <p style={{ marginTop: 0 }}>Your wishlist is empty.</p>
            <Link to="/new" className="btn btn-primary" style={{ width: "fit-content" }}>
              Browse new arrivals
            </Link>
          </div>
        ) : (
          <div className="grid-products" style={{ maxWidth: 1200, margin: '0 auto' }}>
            {products.map((p) => (
              <div key={p.id || p.product_id || p.slug} style={{ position: "relative", isolation: "isolate" }}>
                <button
                  onClick={() => handleRemove(p.id || p.product_id)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    transition: "all 0.2s"
                  }}
                  title="Remove from wishlist"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fee2e2";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <X size={16} color="#dc2626" />
                </button>
              <ProductCard
                id={p.id}
                product_id={p.product_id}
                image={p.image}
                image_url={p.image_url}
                name={p.name}
                price={p.price}
                extra={p.extra}
                slug={p.slug}
              />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}