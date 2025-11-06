// src/components/WishlistPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Heart } from "lucide-react";
import ProductCard from "./ProductCard";

const wishlistProducts = [
  {
    id: 201,
    name: "Premium Running Shoes",
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1719523677291-a395426c1a87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 202,
    name: "Urban Casual Sneakers",
    price: 99.99,
    image:
      "https://images.unsplash.com/photo-1759542890353-35f5568c1c90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 203,
    name: "Lifestyle Comfort Plus",
    price: 119.99,
    image:
      "https://images.unsplash.com/photo-1602504786849-b325e183168b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 204,
    name: "Classic Basketball Pro",
    price: 139.99,
    image:
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 205,
    name: "Athletic Pro Trainer",
    price: 124.99,
    image:
      "https://images.unsplash.com/photo-1639619287843-da4b297d7672?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 206,
    name: "Classic White Sneaker",
    price: 74.99,
    image:
      "https://images.unsplash.com/photo-1631482665588-d3a6f88e65f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 207,
    name: "Street Fashion X",
    price: 109.99,
    image:
      "https://images.unsplash.com/photo-1597081206405-5a13f38c5f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 208,
    name: "Premium Leather Boots",
    price: 149.99,
    image:
      "https://images.unsplash.com/photo-1761052720710-32349209f6b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

export default function WishlistPage() {
  return (
    <>
      {/* Breadcrumb */}
      <section className="bg-slate-50 py-6 border-b">
        <div className="container">
          <div className="flex items-center gap-2 text-sm muted">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight size={16} />
            <span className="text-foreground">Wishlist</span>
          </div>
        </div>
      </section>

      {/* Header */}
      <section className="men-head">
        <div className="container">
          <div className="flex items-center gap-3" style={{ padding: "24px 0" }}>
            <Heart size={28} className="text-[#111827]" />
            <h1 className="men-title" style={{ margin: 0 }}>My Wishlist</h1>
          </div>
          <p className="men-sub">{wishlistProducts.length} items saved for later</p>
        </div>
      </section>

      {/* Grid products */}
      <section className="container" style={{ padding: "32px 0" }}>
        {wishlistProducts.length === 0 ? (
          <div className="center" style={{ background:"#fff", borderRadius:12, padding:48 }}>
            <Heart size={56} className="muted" />
            <h3 style={{ marginTop:12, marginBottom:8 }}>Your wishlist is empty</h3>
            <p className="muted" style={{ marginBottom:16 }}>
              Save your favorite items to your wishlist
            </p>
            <Link to="/" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <>
            <div className="flex" style={{ justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <p className="muted">Showing {wishlistProducts.length} products</p>
              <button className="outline-btn">Add All to Cart</button>
            </div>

            <div className="men-grid">
              {wishlistProducts.map(p => (
                <ProductCard
                  key={p.id}
                  image={p.image}
                  name={p.name}
                  price={p.price}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
