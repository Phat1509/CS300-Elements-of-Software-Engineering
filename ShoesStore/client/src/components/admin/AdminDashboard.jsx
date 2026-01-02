import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      <p className="muted" style={{ marginTop: 0 }}>
        Use the panels below to manage store data.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        <Link to="/admin/products" className="card" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 6 }}>Products</h3>
          <p className="muted" style={{ margin: 0 }}>Create / edit / delete products</p>
        </Link>

        <Link to="/admin/orders" className="card" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 6 }}>Orders</h3>
          <p className="muted" style={{ margin: 0 }}>View orders list</p>
        </Link>
      </div>
    </AdminLayout>
  );
}