// client/src/components/user/WishlistPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Heart } from "lucide-react";
import ProductCard from "./ProductCard";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { getProductDetail } from "../../utilities/api";

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlistEntries, wishlistLoading, refreshWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const userId = user ? (user.id || user.user_id) : null;

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

  const isEmpty = !wishlistLoading && !loadingProducts && products.length === 0;

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link> <ChevronRight size={16} /> <span>Wishlist</span>
        </div>
      </div>

      <section className="container" style={{ padding: "30px 0 60px" }}>
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
            <p style={{ marginTop: 0 }}>Wishlist của bạn đang trống 👀</p>
            <Link to="/new" className="btn btn-primary" style={{ width: "fit-content" }}>
              Browse new arrivals
            </Link>
          </div>
        ) : (
          <div className="grid products-grid">
            {products.map((p) => (
              <ProductCard
                key={p.id || p.product_id || p.slug}
                id={p.id}
                product_id={p.product_id}
                image={p.image}
                image_url={p.image_url}
                name={p.name}
                price={p.price}
                extra={p.extra}
                slug={p.slug}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}