import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getProducts } from "../../ultilities/api";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getProducts()
      .then((data) => {
        if (!mounted) return;
        // show featured / hot products by default
        setProducts(data.filter((p) => p.isHot));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
    return () => (mounted = false);
  }, []);

  if (loading) {
    return <p>Loading products...</p>;
  }

  return (
    <>
      {/* Categories */}
      <section className="cats">
        <div className="container">
          <nav className="cat-nav">
            <a className="cat-item active" href="#">
              All Shoes
            </a>
            <a className="cat-item" href="#">
              Running
            </a>
            <a className="cat-item" href="#">
              Casual
            </a>
            <a className="cat-item" href="#">
              Athletic
            </a>
            <a className="cat-item" href="#">
              Basketball
            </a>
            <a className="cat-item" href="#">
              Lifestyle
            </a>
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
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                image={product.image}
                name={product.name}
                price={product.price}
                extra={
                  product.discountPercent
                    ? `-${product.discountPercent}%`
                    : product.isNew
                    ? "NEW"
                    : ""
                }
              />
            ))}
          </div>

          <div className="center">
            <button className="btn btn-outline btn-lg">
              Load More Products
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
