import React, { useEffect, useMemo, useState } from "react";
import adminApi from "../../ultilities/adminApi";
import AdminLayout from "./AdminLayout";

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    adminApi
      .getOrders()
      .then((o) => {
        if (mounted) setOrders(o || []);
      })
      .catch(console.error)
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const items = orders.reduce((acc, o) => acc + ((o.items && o.items.length) || 0), 0);
    return { total, items };
  }, [orders]);

  return (
    <AdminLayout title="Orders">
      {/* Header stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total orders</div>
          <div className="admin-stat-value">{stats.total}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total items</div>
          <div className="admin-stat-value">{stats.items}</div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="muted">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="admin-empty">
          <h3 style={{ marginTop: 0 }}>No orders found</h3>
          <p className="muted" style={{ margin: 0 }}>
            When customers check out, orders will appear here.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 120 }}>Order</th>
                <th style={{ width: 120 }}>Items</th>
                <th>Created</th>
                <th style={{ width: 140 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>#{o.id}</strong>
                  </td>
                  <td className="muted">{(o.items && o.items.length) || 0}</td>
                  <td className="muted">{o.created_at || "-"}</td>
                  <td>
                    {}
                    <span className="admin-badge admin-badge-warn">Pending</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}