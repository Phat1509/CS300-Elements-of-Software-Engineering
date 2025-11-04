// src/components/Header.js
import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="hd">
      <div className="container hd-in">
        <div className="logo">
          <div className="logo-dot">S</div>
          <span className="logo-text">StepStyle</span>
        </div>

        <nav className="nav">
          <a href="/" className="nav-link">New Arrivals</a>
          <Link to="/men" className="nav-link">Men</Link>
          <Link to="/women" className="nav-link">Women</Link>  {/* mới */}
          <Link to="/kids" className="nav-link">Kids</Link>    {/* mới */}
          <Link to="/sale" className="nav-link">Sale</Link>    {/* mới */}
        </nav>

        <div className="actions">
          <div className="search">
            <span className="search-ico">🔍</span>
            <input className="input" placeholder="Search shoes..." />
          </div>
          <button className="btn btn-outline" aria-label="Wishlist">♡</button>
          <button className="btn btn-outline" aria-label="Account">👤</button>
          <div className="cart">
            <button className="btn btn-outline" aria-label="Cart">🛒</button>
            <span className="badge cart-badge">3</span>
          </div>
        </div>
      </div>
    </header>
  );
}
