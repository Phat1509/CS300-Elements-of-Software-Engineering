// src/components/NewArrivalsPage.jsx
import React, { useState } from "react";
import ProductCard from "./ProductCard";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

const newArrivalsProducts = [
  { id: 101, name: "Future Sprint Elite 2025", price: 159.99, image: "https://images.unsplash.com/photo-1687980985791-7c9b631a74cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjBzbmVha2VycyUyMDIwMjV8ZW58MXx8fHwxNzYxMTkwNjE0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Running", isNew: true },
  { id: 102, name: "Velocity Runner Pro", price: 144.99, image: "https://images.unsplash.com/photo-1719916313433-2c028607d38a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBuZXd8ZW58MXx8fHwxNzYxMTkwNjE1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Running", isNew: true },
  { id: 103, name: "Street Fashion X", price: 129.99, image: "https://images.unsplash.com/photo-1597081206405-5a13f38c5f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwc25lYWtlcnN8ZW58MXx8fHwxNzYxMTc3NjY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Lifestyle", isNew: true },
  { id: 104, name: "CloudWalk Premium", price: 139.99, image: "https://images.unsplash.com/photo-1698018574308-929deec9f832?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzaG9lcyUyMHdoaXRlfGVufDF8fHx8MTc2MTE5MDYxNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Athletic", isNew: true },
  { id: 105, name: "Air Performance Runner", price: 129.99, originalPrice: 159.99, image: "https://images.unsplash.com/photo-1719523677291-a395426c1a87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBwcm9kdWN0fGVufDF8fHx8MTc2MTA2NzQyN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Running", discount: 19, isNew: true },
  { id: 106, name: "Pro Athletic Trainer", price: 149.99, image: "https://images.unsplash.com/photo-1639619287843-da4b297d7672?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMHNob2VzfGVufDF8fHx8MTc2MTE0NjcwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Athletic", isNew: true },
  { id: 107, name: "Basketball Elite Pro", price: 169.99, image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwc2hvZXN8ZW58MXx8fHwxNzYxMTAwODYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Basketball", isNew: true },
  { id: 108, name: "Urban Casual Collection", price: 99.99, originalPrice: 119.99, image: "https://images.unsplash.com/photo-1759542890353-35f5568c1c90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBzbmVha2Vyc3xlbnwxfHx8fDE3NjExNjQ3OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Lifestyle", discount: 17, isNew: true },
  { id: 109, name: "Classic White Sneaker", price: 89.99, image: "https://images.unsplash.com/photo-1631482665588-d3a6f88e65f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmVha2VycyUyMHByb2R1Y3QlMjB3aGl0ZXxlbnwxfHx8fDE3NjExOTAyMDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Casual", isNew: true },
  { id: 110, name: "Lifestyle Comfort Plus", price: 119.99, originalPrice: 139.99, image: "https://images.unsplash.com/photo-1602504786849-b325e183168b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWZlc3R5bGUlMjBzbmVha2Vyc3xlbnwxfHx8fDE3NjExOTAyMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Lifestyle", discount: 14, isNew: true },
  { id: 111, name: "Premium Leather Boots", price: 179.99, image: "https://images.unsplash.com/photo-1761052720710-32349209f6b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib290cyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMTkwMjA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Boots", isNew: true },
  { id: 112, name: "Trail Running Max", price: 139.99, image: "https://images.unsplash.com/photo-1719523677291-a395426c1a87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBwcm9kdWN0fGVufDF8fHx8MTc2MTA2NzQyN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Trail Running", isNew: true },
];

export default function NewArrivalsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200);
  const [sortBy, setSortBy] = useState("newest");

  const displayed = newArrivalsProducts.filter(
    (p) => p.price >= minPrice && p.price <= maxPrice
  );

  return (
    <div className="na">
      {/* Breadcrumb */}
      <section className="na-bc">
        <div className="container na-bc-in">
          <a href="/" className="na-bc-link">Home</a>
          <ChevronRight className="na-bc-sep" size={16} />
          <span>New Arrivals</span>
        </div>
      </section>

      {/* Header */}
      <section className="na-head">
        <div className="container">
          <h1 className="na-title">New Arrivals</h1>
          <p className="na-sub">
            Discover our latest collection of premium footwear. Fresh styles just landed for the new season.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="na-wrap">
        <div className="container na-grid">
          {/* Sidebar */}
          <aside className={`na-side ${showFilters ? "open" : ""}`}>
            <div className="na-card">
              <div className="na-card-top">
                <h3>Filters</h3>
                <button
                  className="link-btn"
                  onClick={() => { setMinPrice(0); setMaxPrice(200); }}
                >
                  Clear All
                </button>
              </div>

              <div className="na-block">
                <h4>Category</h4>
                <div className="na-checks">
                  {["All","Running","Athletic","Lifestyle","Basketball","Casual","Boots"].map(c=>(
                    <label key={c} className="na-check">
                      <input type="checkbox" />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="na-block">
                <h4>Price Range</h4>
                <input type="range" min="0" max="200" step="10" value={minPrice}
                  onChange={(e)=>setMinPrice(Number(e.target.value))} />
                <input type="range" min="0" max="200" step="10" value={maxPrice}
                  onChange={(e)=>setMaxPrice(Number(e.target.value))} />
                <div className="na-range">
                  <span>${minPrice}</span><span>${maxPrice}</span>
                </div>
              </div>

              <div className="na-block">
                <h4>Size (US)</h4>
                <div className="na-sizes">
                  {["7","7.5","8","8.5","9","9.5","10","10.5","11"].map(s=>(
                    <button key={s} type="button" className="size-btn">{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <main className="na-main">
            <div className="na-toolbar">
              <button className="btn btn-outline lg-hidden" onClick={()=>setShowFilters(s=>!s)}>
                <SlidersHorizontal size={16} /> Filters
              </button>

              <p className="muted">Showing {displayed.length} products</p>

              <div className="na-sort">
                <span className="muted">Sort by:</span>
                <select className="input" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            <div className="na-products">
              {displayed.map((p) => (
                <div key={p.id} className="na-card-wrap">
                  <ProductCard
                    {...p}
                    extra={typeof p.discount === "number" ? `-${p.discount}%` : p.isNew ? "New" : undefined}
                  />
                </div>
              ))}
            </div>

            <div className="center">
              <button className="btn btn-outline btn-lg">Load More Products</button>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
