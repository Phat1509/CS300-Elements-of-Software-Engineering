import React, { useEffect, useState } from "react";
import adminApi from "../../ultilities/adminApi";

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let mounted = true;
    adminApi
      .getOrders()
      .then((o) => {
        if (mounted) setOrders(o || []);
      })
      .catch(console.error);
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="container" style={{ padding: 24 }}>
      <h1>Orders (Admin)</h1>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {orders.map((o) => (
            <div
              key={o.id}
              style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>Order #{o.id}</strong>
                  <div className="muted">
                    Items: {o.items && o.items.length}
                  </div>
                </div>
                <div className="muted">{o.created_at}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
