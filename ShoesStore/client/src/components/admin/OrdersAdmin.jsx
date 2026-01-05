import React, { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../../utilities/adminApi";
import AdminLayout from "./AdminLayout";

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      // Đảm bảo data là mảng
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // Hỏi xác nhận trước khi đổi trạng thái quan trọng
    const confirmMsg = 
      newStatus === 'COMPLETED' ? "Xác nhận đơn hàng đã hoàn thành?" :
      newStatus === 'SHIPPING' ? "Xác nhận bắt đầu giao hàng?" : 
      "Đổi trạng thái đơn hàng?";
      
    if (!window.confirm(confirmMsg)) return;

    try {
      await updateOrderStatus(orderId, newStatus);
      // Reload lại danh sách sau khi update thành công
      await loadOrders(); 
      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Update status failed", error);
      alert("Lỗi cập nhật trạng thái. Kiểm tra console.");
    }
  };

  // Helper để render màu sắc trạng thái (dùng class giống ProductAdmin)
  const renderStatusBadge = (status) => {
    let colorClass = "pill-gray"; // Mặc định
    let label = status;

    switch (status) {
      case "PENDING":
        colorClass = "pill-yellow"; // Bạn có thể thêm class này vào CSS hoặc dùng style inline
        break;
      case "SHIPPING":
        colorClass = "pill-blue"; // Cần define thêm hoặc dùng style
        break;
      case "COMPLETED":
        colorClass = "pill-green";
        break;
      case "CANCELLED":
        colorClass = "pill-red";
        break;
      default:
        break;
    }

    // Map style inline cho nhanh nếu chưa có class CSS tương ứng
    const styleMap = {
      PENDING: { backgroundColor: '#fff3cd', color: '#856404' },
      SHIPPING: { backgroundColor: '#cce5ff', color: '#004085' },
      COMPLETED: { backgroundColor: '#d4edda', color: '#155724' },
      CANCELLED: { backgroundColor: '#f8d7da', color: '#721c24' },
    };

    return (
      <span className="pill" style={styleMap[status] || {}}>
        {label}
      </span>
    );
  };

  return (
    <AdminLayout title="Order Management">
      {/* Toolbar (nếu cần filter sau này) */}
      <div className="admin-toolbar" style={{ justifyContent: 'flex-end' }}>
         <button className="btn btn-outline" onClick={loadOrders}>
            🔄 Refresh
         </button>
      </div>

      {loading ? (
        <div className="muted" style={{ padding: 20 }}>Loading orders...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4 muted">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                   // Lấy ID chuẩn
                   const realId = order.id || order.order_id;
                   
                   return (
                    <tr key={realId}>
                      <td>#{realId}</td>
                      <td>
                        {new Date(order.created_at || Date.now()).toLocaleDateString('vi-VN')}
                        <div className="muted small">
                          {new Date(order.created_at || Date.now()).toLocaleTimeString('vi-VN')}
                        </div>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>
                        {Number(order.total_amount).toLocaleString()}₫
                      </td>
                      <td>
                        {renderStatusBadge(order.status)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                          
                          {/* Nút Ship: Chỉ hiện khi Pending */}
                          {order.status === "PENDING" && (
                            <button
                              onClick={() => handleStatusChange(realId, "SHIPPING")}
                              className="btn btn-sm"
                              style={{ backgroundColor: '#007bff', color: 'white', border: 'none' }}
                              title="Start Shipping"
                            >
                              🚚 Ship
                            </button>
                          )}

                          {/* Nút Complete: Hiện khi Pending hoặc Shipping */}
                          {(order.status === "PENDING" || order.status === "SHIPPING") && (
                            <button
                              onClick={() => handleStatusChange(realId, "COMPLETED")}
                              className="btn btn-sm"
                              style={{ backgroundColor: '#28a745', color: 'white', border: 'none' }}
                              title="Mark as Completed"
                            >
                              ✅ Done
                            </button>
                          )}
                          
                          {/* Nếu đã xong thì hiện text */}
                          {order.status === "COMPLETED" && (
                            <span className="muted small">Archived</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default OrdersAdmin;