import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="container" style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>
      <p>Use the links below to manage the store data.</p>
      <ul>
        <li>
          <Link to="/admin/products">Products</Link>
        </li>
        <li>
          <Link to="/admin/orders">Orders</Link>
        </li>
        <li>
          <Link to="/admin/variants">Variants</Link>
        </li>
        <li>
          <Link to="/admin/brands">Brands / Categories</Link>
        </li>
      </ul>
    </div>
  );
}
