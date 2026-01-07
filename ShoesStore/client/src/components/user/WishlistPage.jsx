// client/src/components/user/WishlistPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import Notice from "../common/Notice";
import useNotice from "../../hooks/useNotice";
import { Link } from "react-router-dom";
import { ChevronRight, Heart, X } from "lucide-react";
import ProductCard from "./ProductCard";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { getProductDetail } from "../../utilities/api";

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlistEntries, wishlistLoading, refreshWishlist, removeFromWishlistByProductId } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const { notice, showNotice } = useNotice();

  const userId = user ? (user.id || user.user_id || user.pid) : null;

  const productIds = useMemo(() => {
    const ids = wishlistEntries.map((w) => w.product_id);
    return Array.from(new Set(ids.map((x) => String(x))));
  }, [wishlistEntries]);

  useEffect(() => {
    if (!userId) {
      setProducts([]);
      return;
    }

    const load = async () => {
      setLoadingProducts(true);
      try {
        const list = await Promise.all(
          productIds.map(async (pid) => {
            try {
              return await getProductDetail(pid);
            } catch (e) {
              console.error("getProductDetail error:", pid, e);
              return null;
            }
          })
        );
        setProducts(list.filter(Boolean));
      } finally {
        setLoadingProducts(false);
      }
    };

    load();
  }, [userId, productIds]);

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

  const isEmpty = !wishlistLoading && !loadingProducts && products.length === 0;

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
              Bạn cần <b>Sign in</b> để dùng Wishlist nha.
            </p>
            <Link to="/signin" className="btn btn-primary" style={{ width: "fit-content" }}>
              Go to Sign in
            </Link>
          </div>
        ) : wishlistLoading || loadingProducts ? (
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
          <div className="grid products-grid">
            {products.map((p) => (
              <div key={p.id || p.product_id || p.slug} style={{ position: "relative" }}>
                <button
                  onClick={() => handleRemove(p.id || p.product_id)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 10,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                  title="Remove from wishlist"
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