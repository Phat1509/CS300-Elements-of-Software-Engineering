// src/components/WomenPage.js
import React from "react";
import ProductCard from "./ProductCard";

const womenProducts = [
  { id: 301, name: "Elegant Heels Collection", price: 159.99,
    image: "https://images.unsplash.com/photo-1605733513549-de9b150bd70d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbnMlMjBoZWVscyUyMHNob2VzfGVufDF8fHx8MTc2MTI2OTk2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8, reviews: 324, category: "Heels" },
  { id: 302, name: "Sporty Sneaker Style", price: 129.99,
    image: "https://images.unsplash.com/photo-1695508874958-018d78f412a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbnMlMjBzbmVha2Vyc3xlbnwxfHx8fDE3NjEyNjk5Njh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9, reviews: 487, category: "Sneakers", isNew: true },
  { id: 303, name: "Fashion Boots Premium", price: 199.99,
    image: "https://images.unsplash.com/photo-1696435552089-11a082faa2d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbnMlMjBib290cyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjY5OTY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7, reviews: 268, category: "Boots" },
  { id: 304, name: "Classic White Sneaker", price: 89.99,
    image: "https://images.unsplash.com/photo-1631482665588-d3a6f88e65f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmVha2VycyUyMHByb2R1Y3QlMjB3aGl0ZXxlbnwxfHx8fDE3NjExOTAyMDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9, reviews: 502, category: "Casual" },
  { id: 305, name: "Urban Casual Collection", price: 99.99, originalPrice: 119.99,
    image: "https://images.unsplash.com/photo-1759542890353-35f5568c1c90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBzbmVha2Vyc3xlbnwxfHx8fDE3NjExNjQ3OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.6, reviews: 189, category: "Lifestyle", discount: 17 },
  { id: 306, name: "Athletic Performance Pro", price: 139.99,
    image: "https://images.unsplash.com/photo-1639619287843-da4b297d7672?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMHNob2VzfGVufDF8fHx8MTc2MTE0NjcwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7, reviews: 328, category: "Athletic" },
  { id: 307, name: "Running Elite Max", price: 149.99, originalPrice: 179.99,
    image: "https://images.unsplash.com/photo-1719523677291-a395426c1a87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBwcm9kdWN0fGVufDF8fHx8MTc2MTA2NzQyN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8, reviews: 245, category: "Running", discount: 17 },
  { id: 308, name: "Lifestyle Comfort Plus", price: 119.99,
    image: "https://images.unsplash.com/photo-1602504786849-b325e183168b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWZlc3R5bGUlMjBzbmVha2Vyc3xlbnwxfHx8fDE3NjExOTAyMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7, reviews: 198, category: "Lifestyle" },
  { id: 309, name: "Street Fashion Sneakers", price: 129.99,
    image: "https://images.unsplash.com/photo-1597081206405-5a13f38c5f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwc25lYWtlcnN8ZW58MXx8fHwxNzYxMTc3NjY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7, reviews: 156, category: "Lifestyle", isNew: true },
  { id: 310, name: "Premium Leather Boots", price: 179.99,
    image: "https://images.unsplash.com/photo-1761052720710-32349209f6b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib290cyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMTkwMjA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9, reviews: 412, category: "Boots" },
  { id: 311, name: "CloudWalk Premium", price: 139.99,
    image: "https://images.unsplash.com/photo-1698018574308-929deec9f832?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzaG9lcyUyMHdoaXRlfGVufDF8fHx8MTc2MTE5MDYxNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9, reviews: 203, category: "Athletic" },
  { id: 312, name: "Velocity Runner Pro", price: 144.99, originalPrice: 169.99,
    image: "https://images.unsplash.com/photo-1719916313433-2c028607d38a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBuZXd8ZW58MXx8fHwxNzYxMTkwNjE1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8, reviews: 124, category: "Running", discount: 15, isNew: true },
];

export default function WomenPage() {
  const [maxPrice, setMaxPrice] = React.useState(200);
  const [sortBy, setSortBy] = React.useState("popular");
  const filteredProducts = React.useMemo(
    () => womenProducts.filter((p) => typeof p.price === "number" && p.price <= maxPrice),
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
  const handleClearAll = () => setMaxPrice(200);
  return (
    <main className="men-wrap">
      {/* Breadcrumb */}
      <section className="men-bc">
        <div className="container">
          <a href="/" className="men-bc-link">Home</a>
          <span className="men-bc-sep">›</span>
          <span>Women</span>
        </div>
      </section>

      {/* Header */}
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Women&apos;s Collection</h1>
          <p className="men-sub">
            Discover elegant and comfortable footwear designed for the modern woman.
            From athletic to sophisticated, step into style.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container men-content">
        {/* Sidebar tĩnh để đúng layout */}
        <aside className="men-side">
          <div className="men-card">
            <div className="men-card-top">
              <h3>Filters</h3>
              <button className="link-btn" type="button" onClick={handleClearAll}>Clear All</button>
            </div>

            <div className="men-block">
              <h4>Category</h4>
              <div className="men-checks">
                {["All","Heels","Sneakers","Boots","Athletic","Running","Casual","Lifestyle"].map(c=>(
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
                max="200"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-label="Filter by maximum price"
              />
              <div className="men-range"><span>$0</span><span>${maxPrice}</span></div>
            </div>

            <div className="men-block">
              <h4>Size (US)</h4>
              <div className="men-sizes">
                {["5","5.5","6","6.5","7","7.5","8","8.5","9"].map(s=>(
                  <button key={s} type="button" className="size-btn">{s}</button>
                ))}
              </div>
            </div>

            <div className="men-block">
              <h4>Heel Height</h4>
              <div className="men-checks">
                {["Flat","Low (1-2\")","Mid (2-3\")","High (3-4\")","Very High (4+\")"].map(h=>(
                  <label key={h} className="men-check">
                    <input type="checkbox" />
                    <span>{h}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
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
