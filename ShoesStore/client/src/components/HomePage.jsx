import React from "react";
import ProductCard from "./ProductCard";

export default function HomePage() {
  return (
    <>
      {/* Categories */}
      <section className="cats">
        <div className="container">
          <nav className="cat-nav">
            <a className="cat-item active" href="#">All Shoes</a>
            <a className="cat-item" href="#">Running</a>
            <a className="cat-item" href="#">Casual</a>
            <a className="cat-item" href="#">Athletic</a>
            <a className="cat-item" href="#">Basketball</a>
            <a className="cat-item" href="#">Lifestyle</a>
          </nav>
        </div>
      </section>

      {/* Products */}
      <section className="products">
        <div className="container">
          <div className="prod-top">
            <div>
              <h2 className="ttl">Featured Products</h2>
              <p className="muted">Discover our most popular shoes</p>
            </div>
            <div className="tabs">
              <button className="tab tab-active">All</button>
              <button className="tab">New</button>
              <button className="tab">Sale</button>
            </div>
          </div>

          <div className="grid-products">
            <ProductCard
              image="https://images.unsplash.com/photo-1719523677291-a395426c1a87?auto=format&fit=crop&w=800&q=80"
              name="Air Performance Runner"
              price="129.99"
              extra="-19%"
            />
            <ProductCard
              image="https://images.unsplash.com/photo-1631482665588-d3a6f88e65f0?auto=format&fit=crop&w=800&q=80"
              name="Classic White Sneaker"
              price="89.99"
            />
            <ProductCard
              image="https://images.unsplash.com/photo-1639619287843-da4b297d7672?auto=format&fit=crop&w=800&q=80"
              name="Pro Athletic Trainer"
              price="149.99"
              extra="NEW"
            />
            <ProductCard
              image="https://images.unsplash.com/photo-1759542890353-35f5568c1c90?auto=format&fit=crop&w=800&q=80"
              name="Urban Casual Collection"
              price="99.99"
              extra="-17%"
            />
            <ProductCard
              image="https://images.unsplash.com/photo-1761052720710-32349209f6b4?auto=format&fit=crop&w=800&q=80"
              name="Premium Leather Boots"
              price="179.99"
            />
            <ProductCard
              image="https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=800&q=80"
              name="Basketball Elite Pro"
              price="169.99"
              extra="NEW"
            />
            <ProductCard
              image="https://images.unsplash.com/photo-1602504786849-b325e183168b?auto=format&fit=crop&w=800&q=80"
              name="Lifestyle Comfort Plus"
              price="119.99"
              extra="-14%"
            />
            <ProductCard
              image="https://images.unsplash.com/photo-1719523677291-a395426c1a87?auto=format&fit=crop&w=800&q=80"
              name="Trail Running Max"
              price="139.99"
            />
          </div>

          <div className="center">
            <button className="btn btn-outline btn-lg">Load More Products</button>
          </div>
        </div>
      </section>
    </>
  );
}
