import React, { useEffect, useState } from "react";
import adminApi from "../../utilities/adminApi";
import AdminLayout from "./AdminLayout";

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getOrders();
      setOrders(Array.isArray(data) ? data : (data?.items || []));
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (orderId) => {
    setLoadingDetail(true);
    try {
      const detail = await adminApi.getOrderDetails(orderId);
      setSelectedOrder(detail);
    } catch (err) {
      alert("Không tải được chi tiết đơn hàng: " + err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Chuyển đơn hàng #${orderId} sang trạng thái ${newStatus}?`)) return;
    
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      alert("Cập nhật trạng thái thành công!");
      
      loadOrders(); 
      
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert("Lỗi cập nhật: " + err.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'pill-gray';
      case 'Paid': return 'pill-blue';
      case 'Shipped': return 'pill-purple';
      case 'Delivered': return 'pill-green';
      case 'Cancelled': return 'pill-red';
      default: return 'pill-gray';
    }
  };

  return (
    <AdminLayout title="Quản lý Đơn hàng">
      <div className="admin-panel">
        <div className="admin-panel-top">
             <h3>Danh sách đơn hàng</h3>
             <button className="btn btn-sm btn-outline" onClick={loadOrders}>Làm mới</button>
        </div>

        {loading ? <p>Đang tải dữ liệu...</p> : (
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
                      <td>{Number(order.total_price || order.amount).toLocaleString()}đ</td>
                      <td>{order.payment_method}</td>
                      <td>
                        <span className={`pill ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => handleViewDetail(order.id)}
                        >
                          Chi tiết
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
              <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <button className="btn-icon" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            
            {loadingDetail ? (
                <p>Đang cập nhật...</p> 
            ) : (
                <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', fontSize: '14px' }}>
                  <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
                    <h4 style={{marginTop:0}}>Thông tin khách hàng</h4>
                    <p><strong>Người nhận:</strong> {selectedOrder.full_name || "N/A"}</p>
                    <p><strong>Địa chỉ:</strong> {selectedOrder.shipping_address || "N/A"}</p>
                    <p><strong>Ngày đặt:</strong> {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : "N/A"}</p>
                    <p><strong>Phương thức:</strong> {selectedOrder.payment_method}</p>
                  </div>
                  
                  <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
                    <h4 style={{marginTop:0}}>Xử lý đơn hàng</h4>
                    <label style={{display:'block', marginBottom: '5px'}}>Trạng thái hiện tại:</label>
                    <select 
                      className="input" 
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      style={{ width: '100%', marginBottom: '10px' }}
                    >
                      <option value="Pending">Chờ xử lý (Pending)</option>
                      <option value="Paid">Đã thanh toán (Paid)</option>
                      <option value="Shipped">Đang giao (Shipped)</option>
                      <option value="Delivered">Đã giao (Delivered)</option>
                      <option value="Cancelled">Đã hủy (Cancelled)</option>
                    </select>
                    
                    {selectedOrder.status === 'Pending' && (
                        <p style={{fontSize: '12px', color: '#666'}}>
                            * Có thể hủy đơn khi đơn hàng chưa được xử lý.
                        </p>
                    )}
                  </div>
                </div>

                <h4 className="muted" style={{ marginBottom: '10px' }}>Sản phẩm trong đơn</h4>
                <div style={{maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee'}}>
                    <table className="admin-table mini">
                    <thead>
                        <tr>
                        <th>Tên sản phẩm</th>
                        <th>Phân loại</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                            selectedOrder.items.map((item, idx) => (
                            <tr key={idx}>
                                <td>
                                    {item.product_name || item.product?.name || `Product ID: ${item.product_id || '?'}`}
                                </td>
                                <td>
                                    {item.size && <span className="badge badge-light" style={{marginRight:5}}>{item.size}</span>}
                                    {item.color && <span className="badge badge-light">{item.color}</span>}
                                    {!item.size && !item.color && `Variant #${item.product_variant_id}`}
                                </td>
                                <td>{item.quantity}</td>
                                <td>{Number(item.price).toLocaleString()}đ</td>
                                <td>{Number(item.price * item.quantity).toLocaleString()}đ</td>
                            </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{textAlign: "center"}}>Không có dữ liệu sản phẩm</td></tr>
                        )}
                    </tbody>
                    </table>
                </div>
                
                <div style={{marginTop: '20px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold'}}>
                    Tổng cộng: {Number(selectedOrder.total_price || selectedOrder.amount).toLocaleString()}đ
                </div>
                </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const modalOverlayStyle = { 
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', 
    zIndex: 1000 
};

const modalContentStyle = { 
    width: '95%', maxWidth: '800px', 
    background: '#fff', padding: '25px', 
    borderRadius: '12px', 
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
    maxHeight: '90vh', overflowY: 'auto' 
};