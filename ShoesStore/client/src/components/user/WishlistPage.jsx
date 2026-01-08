// client/src/components/user/WishlistPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Heart } from "lucide-react";
import ProductCard from "./ProductCard";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist, wishlistLoading, toggleWishlist} = useWishlist();

  const isEmpty = !wishlistLoading && wishlist.length === 0;

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
          <h2>Your Wishlist</h2>
        </div>

        {!user ? (
          <div className="card" style={{ padding: 18 }}>
            <p>Bạn cần <b>Sign in</b> để dùng Wishlist nha.</p>
            <Link to="/signin" className="btn btn-primary">Go to Sign in</Link>
          </div>
        ) : wishlistLoading ? (
          <div className="card" style={{ padding: 18 }}>
            <p>Loading wishlist...</p>
          </div>
        ) : isEmpty ? (
          <div className="card" style={{ padding: 18 }}>
            <p>Wishlist của bạn đang trống 👀</p>
            <Link to="/new" className="btn btn-primary">Browse new arrivals</Link>
          </div>
        ) : (
          <div className="men-main">
            <div className="men-grid">
              {wishlist.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  image={p.image_url}   
                  name={p.name}
                  price={p.price}
                  extra={
                    p.discount_percentage
                      ? `-${p.discount_percentage}%`
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
 

}
