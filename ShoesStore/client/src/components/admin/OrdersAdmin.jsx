import React, { useEffect, useState } from "react";
import adminApi from "../../utilities/adminApi"; // Đảm bảo import đúng
import AdminLayout from "./AdminLayout";

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Chuyển đơn hàng #${orderId} sang trạng thái ${newStatus}?`)) return;
    
    try {
      // SỬA TÊN HÀM Ở ĐÂY CHO KHỚP VỚI adminApi.js
      await adminApi.updateOrderStatus(orderId, newStatus);
      alert("Cập nhật trạng thái thành công!");
      loadOrders(); 
      setSelectedOrder(null);
    } catch (err) {
      alert("Lỗi cập nhật: " + err.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'pill-gray';
      case 'Paid': return 'pill-blue';
      case 'Shipped': return 'pill-blue';
      case 'Delivered': return 'pill-green';
      case 'Cancelled': return 'pill-red';
      default: return 'pill-gray';
    }
  };

  return (
    <AdminLayout title="Quản lý Đơn hàng">
      <div className="admin-panel">
        {loading ? <p>Đang tải đơn hàng...</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>ID Khách</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="6" style={{textAlign:'center', padding: '20px'}}>Không có đơn hàng nào.</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td><strong>#{order.id}</strong></td>
                      <td>User #{order.user_id}</td>
                      <td>{Number(order.amount).toLocaleString()}đ</td>
                      <td>{order.payment_method}</td>
                      <td>
                        <span className={`pill ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => setSelectedOrder(order)}
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                        >
                          Chi tiết / Xử lý
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="admin-modal-overlay" style={modalOverlayStyle}>
          <div className="admin-panel" style={modalContentStyle}>
            <div className="admin-panel-top">
              <h3>Đơn hàng #{selectedOrder.id}</h3>
              <button className="btn-icon" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <p><strong>Địa chỉ:</strong> {selectedOrder.shipping_address || "N/A"}</p>
                <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                <p><strong>Phương thức:</strong> {selectedOrder.payment_method}</p>
              </div>
              <div>
                <label><strong>Cập nhật trạng thái:</strong></label>
                <select 
                  className="input" 
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                  style={{ marginTop: '8px' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <h4 className="muted" style={{ marginBottom: '10px' }}>Danh sách sản phẩm</h4>
            <table className="admin-table mini">
              <thead>
                <tr>
                  <th>Sản phẩm (Variant ID)</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>Biến thể #{item.product_variant_id}</td>
                    <td>{item.quantity}</td>
                    <td>{Number(item.price).toLocaleString()}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle = { width: '95%', maxWidth: '700px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };