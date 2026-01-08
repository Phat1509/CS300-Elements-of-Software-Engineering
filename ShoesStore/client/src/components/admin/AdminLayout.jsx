// src/components/admin/AdminLayout.jsx
import React from "react";
import { NavLink, Link } from "react-router-dom";

export default function AdminLayout({ title, children }) {
  return (
    <div className="admin">
      {/* Sidebar */}
      <aside className="admin-side">
        <Link to="/admin" className="admin-brand" aria-label="Admin Home">
          <div className="admin-brand-dot">S</div>
          <div>
            <div className="admin-brand-name">StepStyle</div>
            <div className="admin-brand-sub">Admin Panel</div>
          </div>
        </Link>

        <nav className="admin-nav">
          <NavLink to="/admin" end className="admin-link">
            📊 Dashboard
          </NavLink>
          
          <NavLink to="/admin/products" className="admin-link">
            👟 Products
          </NavLink>

          <NavLink to="/admin/categories" className="admin-link">
            🗂 Categories
          </NavLink>

          <NavLink to="/admin/brands" className="admin-link">
            🏷 Brands
          </NavLink>

          <NavLink to="/admin/orders" className="admin-link">
            📦 Orders
          </NavLink>
        </nav>

        <div className="admin-side-bottom">
          <div className="admin-hint">
            <Link to="/" style={{ color: '#cbd5e1', fontSize: '13px', textDecoration: 'none' }}>
              ← Back to Website
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h1 className="admin-title">{title || "Admin"}</h1>
          <div className="admin-user-info" style={{ fontSize: '14px', color: '#64748b' }}>
             Role: Administrator
          </div>
        </div>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}