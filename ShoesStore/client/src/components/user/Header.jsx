// client/src/components/user/Header.jsx
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const count = cartItems.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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

          {/* Display logic: If NOT logged in, show Sign in/Join us */}
          {!user && (
            <>
              <NavLink to="/signin" className="nav-link auth-link">
                Sign in
              </NavLink>
              <NavLink to="/signup" className="nav-link auth-link-primary">
                Join us
              </NavLink>
            </>
          )}
        </nav>

        {/* Actions (right) */}
        <div className="actions">
          {/* Wishlist */}
          <Link to="/wishlist" className="btn btn-outline" aria-label="Wishlist">
            ♡
          </Link>

          {/* User Actions */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Orders */}
              <Link
                to="/orders"
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                📦 Orders
              </Link>

              {/* Divider */}
              <div style={{ width: "1px", height: "14px", background: "#ccc" }} />

              {/* Profile */}
              <Link
                to="/profile"
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                👤 Profile
              </Link>

              {/* Divider */}
              <div style={{ width: "1px", height: "14px", background: "#ccc" }} />

              {/* Show user name */}
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                Hi, {user.name}
              </span>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{
                  fontSize: "12px",
                  padding: "4px 8px",
                  marginLeft: "4px",
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            // If not logged in, user icon links to signin page
            <Link to="/signin" className="btn btn-outline" aria-label="Account">
              👤
            </Link>
          )}

          {/* Cart Icon & Badge */}
          <div className="cart">
            <Link to="/cart" className="btn btn-outline" aria-label="Cart">
              🛒
            </Link>
            {/* Only show badge when count > 0 */}
            {count > 0 && <span className="badge cart-badge">{count}</span>}
          </div>
        </div>
      </div>
    </header>
  );
}
