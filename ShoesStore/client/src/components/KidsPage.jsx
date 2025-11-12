// src/components/KidsPage.js
import React from "react";
import ProductCard from "./ProductCard";

const kidsProducts = [
  { id: 401, name: "Kids Colorful Sneakers", price: 59.99,
    image: "https://images.unsplash.com/photo-1707013537977-90e0a6cfa484?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwc25lYWtlcnMlMjBzaG9lc3xlbnwxfHx8fDE3NjEyNDAwODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8, reviews: 156, category: "Sneakers", isNew: true },
  { id: 402, name: "Youth Running Shoes", price: 69.99,
    image: "https://images.unsplash.com/photo-1698749803716-7c7bacfa6721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHJ1bm5pbmclMjBzaG9lc3xlbnwxfHx8fDE3NjEyNzAxNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7, reviews: 203, category: "Running" },
  { id: 403, name: "Junior Sports Trainer", price: 54.99, originalPrice: 74.99,
    image: "https://images.unsplash.com/photo-1584769362605-6185087917c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwc3BvcnRzJTIwc2hvZXN8ZW58MXx8fHwxNzYxMjUxMzM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9, reviews: 187, category: "Athletic", discount: 27 },
  { id: 404, name: "Kids Classic White", price: 49.99,
    image: "https://images.unsplash.com/photo-1631482665588-d3a6f88e65f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmVha2VycyUyMHByb2R1Y3QlMjB3aGl0ZXxlbnwxfHx8fDE3NjExOTAyMDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8, reviews: 234, category: "Casual" },
  { id: 405, name: "Youth Basketball Shoes", price: 79.99,
    image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwc2hvZXN8ZW58MXx8fHwxNzYxMTAwODYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.6, reviews: 145, category: "Basketball", isNew: true },
  { id: 406, name: "Kids Trail Runner", price: 64.99, originalPrice: 84.99,
    image: "https://images.unsplash.com/photo-1719523677291-a395426c1a87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBwcm9kdWN0fGVufDF8fHx8MTc2MTA2NzQyN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7, reviews: 176, category: "Running", discount: 24 },
  { id: 407, name: "Youth Urban Sneakers", price: 59.99,
    image: "https://images.unsplash.com/photo-1759542890353-35f5568c1c90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBzbmVha2Vyc3xlbnwxfHx8fDE3NjExNjQ3OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.5, reviews: 198, category: "Lifestyle" },
  { id: 408, name: "Kids Athletic Pro", price: 69.99,
    image: "https://images.unsplash.com/photo-1639619287843-da4b297d7672?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMHNob2VzfGVufDF8fHx8MTc2MTE0NjcwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8, reviews: 167, category: "Athletic" },
  { id: 409, name: "Youth Lifestyle Comfort", price: 54.99,
    image: "https://images.unsplash.com/photo-1602504786849-b325e183168b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWZlc3R5bGUlMjBzbmVha2Vyc3xlbnwxfHx8fDE3NjExOTAyMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.6, reviews: 143, category: "Lifestyle" },
  { id: 410, name: "Kids Fashion Sneakers", price: 59.99, originalPrice: 69.99,
    image: "https://images.unsplash.com/photo-1597081206405-5a13f38c5f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwc25lYWtlcnN8ZW58MXx8fHwxNzYxMTc3NjY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7, reviews: 189, category: "Lifestyle", discount: 14, isNew: true },
  { id: 411, name: "Junior Performance Run", price: 74.99,
    image: "https://images.unsplash.com/photo-1687980985791-7c9b631a74cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjBzbmVha2VycyUyMDIwMjV8ZW58MXx8fHwxNzYxMTkwNjE0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9, reviews: 156, category: "Running" },
  { id: 412, name: "Kids Premium Boots", price: 89.99,
    image: "https://images.unsplash.com/photo-1761052720710-32349209f6b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib290cyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMTkwMjA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8, reviews: 178, category: "Boots" },
];

export default function KidsPage() {
  const [maxPrice, setMaxPrice] = React.useState(100);
  const [sortBy, setSortBy] = React.useState("popular");
  const filteredProducts = React.useMemo(
    () => kidsProducts.filter((p) => typeof p.price === "number" && p.price <= maxPrice),
    [maxPrice]
  );
  const sortedProducts = React.useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case "price-low":
        return arr.sort((a, b) => a.price - b.price);
      case "price-high":
        return arr.sort((a, b) => b.price - a.price);
      case "rating":
        return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "newest":
        return arr.sort((a, b) => b.id - a.id);
      case "popular":
      default:
        return arr.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    }
  }, [filteredProducts, sortBy]);
  const handleClearAll = () => setMaxPrice(100);
  return (
    <main className="men-wrap">
      {/* Breadcrumb */}
      <section className="men-bc">
        <div className="container">
          <a href="/" className="men-bc-link">Home</a>
          <span className="men-bc-sep">›</span>
          <span>Kids</span>
        </div>
      </section>

      {/* Header */}
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Kids&apos; Collection</h1>
          <p className="men-sub">
            Fun and comfortable footwear for active kids. Durable designs that keep up with their
            adventures while looking great.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container men-content">
        <aside className="men-side">
          <div className="men-card">
            <div className="men-card-top">
              <h3>Filters</h3>
              <button className="link-btn" type="button" onClick={handleClearAll}>Clear All</button>
            </div>

            <div className="men-block">
              <h4>Age Group</h4>
              <div className="men-checks">
                {["All Ages","Toddler (1-3)","Little Kid (4-7)","Big Kid (8-12)"].map(a=>(
                  <label key={a} className="men-check">
                    <input type="checkbox" />
                    <span>{a}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="men-block">
              <h4>Category</h4>
              <div className="men-checks">
                {["All","Running","Athletic","Casual","Basketball","Lifestyle","Boots"].map(c=>(
                  <label key={c} className="men-check">
                    <input type="checkbox" />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="men-block">
              <h4>Price Range</h4>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-label="Filter by maximum price"
              />
              <div className="men-range"><span>$0</span><span>${maxPrice}</span></div>
            </div>

            <div className="men-block">
              <h4>Size (US)</h4>
              <div className="men-sizes">
                {["10C","11C","12C","13C","1Y","2Y","3Y","4Y","5Y"].map(s=>(
                  <button key={s} type="button" className="size-btn">{s}</button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="men-main">
          <div className="men-toolbar">
            <p className="muted">Showing {filteredProducts.length} products</p>
            <div className="men-sort">
              <span className="muted">Sort by:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          <div className="men-grid">
            {sortedProducts.map(p => <ProductCard key={p.id} {...p} />)}
          </div>

          <div className="men-load">
            <button className="outline-btn" type="button">Load More Products</button>
          </div>
        </div>
      </section>
    </main>
  );
}
