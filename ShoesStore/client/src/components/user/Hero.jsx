import React from "react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-in">
        <div className="hero-left">
          <div className="pill">New Collection 2025</div>
          <h1>Step Into Your Perfect Style</h1>
          <p className="muted">
            Discover the latest in footwear fashion. From athletic performance
            to everyday comfort, find your perfect pair.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg">Shop Now →</button>
            <button className="btn btn-outline btn-lg">View Collection</button>
          </div>
          <div className="stats">
            <div>
              <div className="stat-num">500+</div>
              <div className="muted">Shoe Styles</div>
            </div>
            <div>
              <div className="stat-num">50K+</div>
              <div className="muted">Happy Customers</div>
            </div>
            <div>
              <div className="stat-num">4.9</div>
              <div className="muted">Average Rating</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="img-overlay"></div>
          <img
            src="https://images.unsplash.com/photo-1663244375429-adfbccdac32a?auto=format&fit=crop&w=1200&q=80"
            alt="Featured shoes"
          />
        </div>
      </div>
    </section>
  );
}
