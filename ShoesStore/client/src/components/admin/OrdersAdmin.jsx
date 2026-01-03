import React, { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '../../ultilities/adminApi';

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await getOrders();
    setOrders(data);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    loadOrders(); // Reload lại danh sách sau khi update
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Quản lý Đơn hàng</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Ngày đặt</th>
            <th className="border p-2">Tổng tiền</th>
            <th className="border p-2">Trạng thái</th>
            <th className="border p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id || order.order_id}>
              <td className="border p-2">{order.id || order.order_id}</td>
              <td className="border p-2">{new Date(order.created_at).toLocaleString()}</td>
              <td className="border p-2">{order.total_amount?.toLocaleString()} đ</td>
              <td className="border p-2">
                <span className={`px-2 py-1 rounded text-sm font-bold 
                  ${order.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' : 
                    order.status === 'COMPLETED' ? 'bg-green-200 text-green-800' : 'bg-gray-200'}`}>
                  {order.status}
                </span>
              </td>
              <td className="border p-2 space-x-2">
                {order.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => handleStatusChange(order.id, 'SHIPPING')}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Ship
                    </button>
                    <button 
                      onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                      className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Hoàn tất
                    </button>
                  </>
                )}
                 {order.status === 'SHIPPING' && (
                    <button 
                      onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                      className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Đã giao
                    </button>
                 )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersAdmin;