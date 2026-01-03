// client/src/components/user/Header.jsx
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import AuthContext
import { useCart } from "../../context/CartContext"; // Import CartContext

export default function Header() {
  const { user, logout } = useAuth(); // Lấy user info và hàm logout
  const { cartItems } = useCart();    // Lấy giỏ hàng
  const navigate = useNavigate();

  // Tính tổng số lượng item trong giỏ
  const count = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

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
          <NavLink to="/new" className="nav-link">New Arrivals</NavLink>
          <NavLink to="/men" className="nav-link">Men</NavLink>
          <NavLink to="/women" className="nav-link">Women</NavLink>
          <NavLink to="/kids" className="nav-link">Kids</NavLink>
          <NavLink to="/sale" className="nav-link">Sale</NavLink>

          {/* Logic hiển thị: Nếu CHƯA login thì hiện Sign in/Join us */}
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
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Hiển thị tên User */}
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                Hi, {user.username}
              </span>
              {/* Nút Logout */}
              <button 
                onClick={handleLogout} 
                className="btn btn-outline"
                style={{ fontSize: "12px", padding: "4px 8px" }}
              >
                Logout
              </button>
            </div>
          ) : (
            // Nếu chưa login, icon người dẫn đến trang signin
            <Link to="/signin" className="btn btn-outline" aria-label="Account">
              👤
            </Link>
          )}

          {/* Cart Icon & Badge */}
          <div className="cart">
            <Link to="/cart" className="btn btn-outline" aria-label="Cart">
              🛒
            </Link>
            {/* Chỉ hiện badge khi số lượng > 0 */}
            {count > 0 && <span className="badge cart-badge">{count}</span>}
          </div>
        </div>
      </div>
    </header>
  );
}