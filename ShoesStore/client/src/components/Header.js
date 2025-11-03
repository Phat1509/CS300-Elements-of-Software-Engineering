import React from "react";

export default function Header() {
  return (
    <header className="hd">
      <div className="container hd-in">
        <div className="logo">
          <div className="logo-dot">S</div>
          <span className="logo-text">StepStyle</span>
        </div>

        <nav className="nav">
          <a href="#" className="nav-link active">New Arrivals</a>
          <a href="#" className="nav-link">Men</a>
          <a href="#" className="nav-link">Women</a>
          <a href="#" className="nav-link">Kids</a>
          <a href="#" className="nav-link">Sale</a>
        </nav>

        <div className="actions">
          <div className="search">
            <span className="search-ico">🔍</span>
            <input className="input" placeholder="Search shoes..." />
          </div>
          <button className="btn btn-outline">♡</button>
          <button className="btn btn-outline">👤</button>
          <div className="cart">
            <button className="btn btn-outline">🛒</button>
            <span className="badge cart-badge">3</span>
          </div>
        </div>
      </div>
    </header>
  );
}
