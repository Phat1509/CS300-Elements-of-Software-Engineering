// src/components/SalePage.js
import React from "react";
import ProductCard from "./ProductCard";

const saleProducts = [
  {
    id: 501,
    name: "Air Performance Runner",
    price: 129.99,
    originalPrice: 159.99,
    image:
      "https://images.unsplash.com/photo-1719523677291-a395426c1a87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBwcm9kdWN0fGVufDF8fHx8MTc2MTA2NzQyN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8,
    reviews: 245,
    category: "Running",
    discount: 19,
  },
  {
    id: 502,
    name: "Urban Casual Collection",
    price: 99.99,
    originalPrice: 119.99,
    image:
      "https://images.unsplash.com/photo-1759542890353-35f5568c1c90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBzbmVha2Vyc3xlbnwxfHx8fDE3NjExNjQ3OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.6,
    reviews: 189,
    category: "Lifestyle",
    discount: 17,
  },
  {
    id: 503,
    name: "Lifestyle Comfort Plus",
    price: 119.99,
    originalPrice: 139.99,
    image:
      "https://images.unsplash.com/photo-1602504786849-b325e183168b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWZlc3R5bGUlMjBzbmVha2Vyc3xlbnwxfHx8fDE3NjExOTAyMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7,
    reviews: 198,
    category: "Lifestyle",
    discount: 14,
  },
  {
    id: 504,
    name: "Running Elite Max",
    price: 149.99,
    originalPrice: 179.99,
    image:
      "https://images.unsplash.com/photo-1630861460368-5620bd06adfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxlJTIwZGlzY291bnQlMjBzaG9lc3xlbnwxfHx8fDE3NjEyNzAxNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8,
    reviews: 312,
    category: "Running",
    discount: 17,
  },
  {
    id: 505,
    name: "Velocity Runner Pro",
    price: 144.99,
    originalPrice: 169.99,
    image:
      "https://images.unsplash.com/photo-1719916313433-2c028607d38a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBuZXd8ZW58MXx8fHwxNzYxMTkwNjE1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8,
    reviews: 124,
    category: "Running",
    discount: 15,
  },
  {
    id: 506,
    name: "Classic Basketball Pro",
    price: 139.99,
    originalPrice: 169.99,
    image:
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwc2hvZXN8ZW58MXx8fHwxNzYxMTAwODYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8,
    reviews: 276,
    category: "Basketball",
    discount: 18,
  },
  {
    id: 507,
    name: "Athletic Pro Trainer",
    price: 124.99,
    originalPrice: 149.99,
    image:
      "https://images.unsplash.com/photo-1639619287843-da4b297d7672?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMHNob2VzfGVufDF8fHx8MTc2MTE0NjcwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7,
    reviews: 328,
    category: "Athletic",
    discount: 17,
  },
  {
    id: 508,
    name: "Premium Leather Boots",
    price: 149.99,
    originalPrice: 179.99,
    image:
      "https://images.unsplash.com/photo-1761052720710-32349209f6b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib290cyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMTkwMjA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9,
    reviews: 412,
    category: "Boots",
    discount: 17,
  },
  {
    id: 509,
    name: "Classic White Sneaker",
    price: 74.99,
    originalPrice: 89.99,
    image:
      "https://images.unsplash.com/photo-1631482665588-d3a6f88e65f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmVha2VycyUyMHByb2R1Y3QlMjB3aGl0ZXxlbnwxfHx8fDE3NjExOTAyMDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9,
    reviews: 502,
    category: "Casual",
    discount: 17,
  },
  {
    id: 510,
    name: "Street Fashion X",
    price: 109.99,
    originalPrice: 129.99,
    image:
      "https://images.unsplash.com/photo-1597081206405-5a13f38c5f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwc25lYWtlcnN8ZW58MXx8fHwxNzYxMTc3NjY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7,
    reviews: 156,
    category: "Lifestyle",
    discount: 15,
  },
  {
    id: 511,
    name: "CloudWalk Premium",
    price: 119.99,
    originalPrice: 139.99,
    image:
      "https://images.unsplash.com/photo-1698018574308-929deec9f832?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzaG9lcyUyMHdoaXRlfGVufDF8fHx8MTc2MTE5MDYxNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9,
    reviews: 203,
    category: "Athletic",
    discount: 14,
  },
  {
    id: 512,
    name: "Junior Sports Trainer",
    price: 54.99,
    originalPrice: 74.99,
    image:
      "https://images.unsplash.com/photo-1584769362605-6185087917c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwc3BvcnRzJTIwc2hvZXN8ZW58MXx8fHwxNzYxMjUxMzM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9,
    reviews: 187,
    category: "Kids",
    discount: 27,
  },
];

export default function SalePage() {
  return (
    <main className="men-wrap">
      {/* Breadcrumb */}
      <section className="men-bc">
        <div className="container">
          <a href="/" className="men-bc-link">Home</a>
          <span className="men-bc-sep">›</span>
          <span>Sale</span>
        </div>
      </section>

      {/* Header */}
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Sale — Up to 30% Off</h1>
          <p className="men-sub">
            Don&apos;t miss out on amazing deals! Shop our sale collection and save big on premium footwear.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container men-content">
        {/* Sidebar (tĩnh) */}
        <aside className="men-side">
          <div className="men-card">
            <div className="men-card-top">
              <h3>Filters</h3>
              <button className="link-btn" type="button">Clear All</button>
            </div>

            <div className="men-block">
              <h4>Discount</h4>
              <div className="men-checks">
                {["10% and above","20% and above","30% and above","40% and above"].map(d=>(
                  <label key={d} className="men-check">
                    <input type="checkbox" />
                    <span>{d}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="men-block">
              <h4>Category</h4>
              <div className="men-checks">
                {["All","Running","Athletic","Lifestyle","Basketball","Casual","Boots","Kids"].map(c=>(
                  <label key={c} className="men-check">
                    <input type="checkbox" />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="men-block">
              <h4>Price Range</h4>
              <input type="range" min="0" max="200" step="10" />
              <div className="men-range"><span>$0</span><span>$200</span></div>
            </div>

            <div className="men-block">
              <h4>Gender</h4>
              <div className="men-checks">
                {["Men","Women","Kids","Unisex"].map(g=>(
                  <label key={g} className="men-check">
                    <input type="checkbox" />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="men-block">
              <h4>Size (US)</h4>
              <div className="men-sizes">
                {["7","7.5","8","8.5","9","9.5","10","10.5","11"].map(s=>(
                  <button key={s} type="button" className="size-btn">{s}</button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="men-main">
          <div className="men-toolbar">
            <p className="muted">Showing {saleProducts.length} products on sale</p>
            <div className="men-sort">
              <span className="muted">Sort by:</span>
              <select defaultValue="discount">
                <option value="discount">Biggest Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          <div className="men-grid">
            {saleProducts.map(p => <ProductCard key={p.id} {...p} />)}
          </div>

          <div className="men-load">
            <button className="outline-btn" type="button">Load More Products</button>
          </div>
        </div>
      </section>
    </main>
  );
}
