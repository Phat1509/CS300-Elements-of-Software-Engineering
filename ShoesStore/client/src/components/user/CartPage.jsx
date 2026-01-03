// client/src/components/user/CartPage.jsx
import React from "react";
import { Link } from "react-router-dom"; 
import { ChevronRight, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext"; // Import Context

export default function CartPage() {
  // Lấy dữ liệu và hàm từ CartContext
  const { cartItems, total, addToCart, removeFromCart } = useCart();

  // Tính toán phí vận chuyển và thuế dựa trên total từ Context
  const subtotal = total;
  const shipping = cartItems.length > 0 ? 10 : 0;
  const tax = subtotal * 0.08;
  const finalTotal = subtotal + shipping + tax;

  // Xử lý tăng số lượng (+1)
  const increaseQty = (item) => {
    // Gọi hàm addToCart với số lượng dương để cộng dồn
    addToCart(item.variant_id, 1);
  };

  // Xử lý giảm số lượng (-1)
  const decreaseQty = (item) => {
    if (item.quantity > 1) {
      // Gọi hàm addToCart với số lượng âm để trừ đi
      addToCart(item.variant_id, -1);
    }
  };

  // Xử lý xóa sản phẩm
  const handleRemove = (id) => {
    // id ở đây là id của cart_item
    removeFromCart(id);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    alert("Proceeding to checkout... (Feature coming soon)");
  };

  return (
    <>
      <section className="men-bc">
        <div className="container" style={{ display: "flex", gap: 8 }}>
          <Link to="/" className="men-bc-link">
            Home
          </Link>
          <span className="men-bc-sep">
            <ChevronRight size={16} />
          </span>
          <span>Cart</span>
        </div>
      </section>

      <section className="container" style={{ padding: "24px 0 40px" }}>
        <h1 className="men-title" style={{ marginBottom: 8 }}>
          Your Cart
        </h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          {cartItems.length} item(s) · Free returns within 30 days
        </p>

        {cartItems.length === 0 ? (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 24,
              textAlign: "center",
              background: "#f8fafc",
            }}
          >
            <ShoppingBag className="h-16 w-16 mx-auto" />
            <h3 style={{ marginTop: 12, marginBottom: 8 }}>
              Your cart is empty
            </h3>
            <p className="muted" style={{ marginBottom: 16 }}>
              Start exploring our latest collections.
            </p>
            <Link to="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr" }}>
            <div
              style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr" }}
            >
              <div
                style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr" }}
              >
                {cartItems.map((it) => (
                  <div
                    key={it.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "96px 1fr auto",
                      gap: 16,
                      alignItems: "center",
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    {/* Ảnh sản phẩm */}
                    <img
                      src={it.image}
                      alt={it.product_name}
                      style={{
                        width: 96,
                        height: 96,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div>
                          {/* Tên sản phẩm */}
                          <h4 style={{ margin: 0 }}>{it.product_name}</h4>
                          <div className="muted" style={{ marginTop: 4 }}>
                            {/* Hiển thị Size / Color */}
                            Size: {it.size} | Color: {it.color}
                          </div>
                        </div>
                        <strong>${it.price.toFixed(2)}</strong>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 12,
                        }}
                      >
                        {/* Nút Giảm */}
                        <button
                          className="btn btn-outline"
                          onClick={() => decreaseQty(it)}
                          disabled={it.quantity <= 1} // Disable nếu chỉ còn 1
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        
                        {/* Số lượng */}
                        <div
                          style={{
                            minWidth: 40,
                            textAlign: "center",
                            fontWeight: 700,
                          }}
                        >
                          {it.quantity}
                        </div>

                        {/* Nút Tăng */}
                        <button
                          className="btn btn-outline"
                          onClick={() => increaseQty(it)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>

                        {/* Nút Xóa */}
                        <button
                          className="btn btn-outline"
                          style={{ marginLeft: "auto", color: "red", borderColor: "#fee2e2" }}
                          onClick={() => handleRemove(it.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ORDER SUMMARY */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>
                  Order Summary
                </h3>
                <div style={{ display: "grid", gap: 8 }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span className="muted">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span className="muted">Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span className="muted">Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <hr />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: 800,
                      fontSize: "1.1rem"
                    }}
                  >
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>

                  <button
                    className="btn btn-primary btn-lg"
                    style={{ marginTop: 12 }}
                    onClick={handleCheckout}
                  >
                    Checkout
                  </button>
                </div>

                <hr />
                <div>
                  <p style={{ marginBottom: 8, fontWeight: 600 }}>
                    Payment methods
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <div className="badge">Visa</div>
                    <div className="badge">Mastercard</div>
                    <div className="badge">Apple Pay</div>
                    <div className="badge">PayPal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}