// src/components/Header.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="hd">
      <div className="container hd-in">
        {/* Logo */}
        <Link to="/" className="logo" aria-label="Go home">
          <div className="logo-dot">S</div>
          <span className="logo-text">StepStyle</span>
        </Link>

        {/* Nav */}
        <nav className="nav">
          <NavLink to="/new" className="nav-link">
            New Arrivals
          </NavLink>
          <NavLink to="/men" className="nav-link">
            Men
          </NavLink>
          <NavLink to="/women" className="nav-link">
            Women
          </NavLink>
          <NavLink to="/kids" className="nav-link">
            Kids
          </NavLink>
          <NavLink to="/sale" className="nav-link">
            Sale
          </NavLink>

          {/* Sign in and Join us */}
          <NavLink to="/signin" className="nav-link auth-link">
            Sign in
          </NavLink>
          <NavLink to="/signup" className="nav-link auth-link-primary">
            Join us
          </NavLink>
        </nav>

        {/* Actions (right) */}
        <div className="actions">
          <Link to="/wishlist" className="btn btn-outline" aria-label="Wishlist">
            ♡
          </Link>

          {/* Icon account to Sign in */}
          <Link to="/signin" className="btn btn-outline" aria-label="Account">
            👤
          </Link>

          <div className="cart">
            <Link to="/cart" className="btn btn-outline" aria-label="Cart">
              🛒
            </Link>
            <span className="badge cart-badge">3</span>
          </div>
        </div>
      </div>
    </header>
  );
}
