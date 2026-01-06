// client/src/components/user/CartPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { ChevronRight, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";

import {
  createOrder,
  addOrderItem,
  updateProductStock,
  deleteCartItem,
} from "../../utilities/api";

export default function CartPage() {
  const { cartItems, total, addToCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Lấy user từ localStorage (giả sử bạn lưu user khi login)
  const user = JSON.parse(localStorage.getItem("user"));

  // Tính toán phí
  const subtotal = total;
  const shipping = cartItems.length > 0 ? 10 : 0; // Phí ship cố định 10$
  const tax = subtotal * 0.08; // Thuế 8%
  const finalTotal = subtotal + shipping + tax;

  // --- HANDLERS ---

  const increaseQty = (item) => {
    // Kiểm tra tồn kho trước khi tăng
    if (item.quantity >= item.stock) {
      alert(`Only ${item.stock} items left in stock!`);
      return;
    }
    addToCart(item.variant_id, 1);
  };

  const decreaseQty = (item) => {
    if (item.quantity > 1) {
      addToCart(item.variant_id, -1);
    }
  };

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  // --- CORE CHECKOUT LOGIC ---
  const handleCheckout = async () => {
    // 1. Validate User
    if (!user) {
      alert("Please login to checkout!");
      navigate("/signin");
      return;
    }

    if (cartItems.length === 0) return;

    // 2. Validate Stock lần cuối
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        alert(
          `Product "${item.product_name}" is out of stock (Available: ${item.stock}). Please update quantity.`
        );
        return;
      }
    }

    // 3. Confirm
    if (!window.confirm(`Confirm payment of $${finalTotal.toFixed(2)}?`)) return;

    setLoading(true);

    try {
      // ✅ FIX: ưu tiên user.user_id (number) trước, fallback mới tới user.id (string)
      const primaryUserId = user?.user_id ?? user?.id;
      if (!primaryUserId) {
        throw new Error("Missing user id (user_id / id).");
      }

      // BƯỚC A: Tạo Order Header
      const orderData = {
        user_id: primaryUserId, // ✅ QUAN TRỌNG
        status: "PENDING",
        total_amount: finalTotal,
        created_at: new Date().toISOString(),
        customer_note: "Standard Shipping",
        shipping_fee: shipping,
        tax: tax,
      };

      const newOrder = await createOrder(orderData);

      // ✅ FIX issue 3: CHỈ dùng json-server `id` để route + order_item FK (không dùng order_id)
      const orderId = newOrder?.id;
      if (!orderId) {
        throw new Error("Order created but missing `id`.");
      }

      // BƯỚC B: Xử lý từng item (Song song)
      await Promise.all(
        cartItems.map(async (item) => {
          // 1. Thêm vào bảng Order Item
          await addOrderItem({
            order_id: orderId,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price: item.price,
          });

          // 2. Trừ tồn kho (Stock)
          const newStock = item.stock - item.quantity;
          await updateProductStock(item.variant_id, newStock);

          // 3. Xóa khỏi DB Giỏ hàng
          // Lưu ý: item.id ở đây là id của dòng trong bảng cart_items
          await deleteCartItem(item.id);
        })
      );

      // BƯỚC C: Hoàn tất
      alert("Order placed successfully!");

      // Force reload hoặc điều hướng để làm mới Context giỏ hàng
      // Vì Context hiện tại chưa biết DB đã bị xóa sạch
      window.location.href = "/orders";
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
            {" "}
            {/* Mobile first layout, consider media queries for desktop */}
            <div
              style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr" }}
            >
              {/* LIST ITEMS */}
              <div style={{ display: "grid", gap: 16 }}>
                {cartItems.map((it) => (
                  <div
                    key={it.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "96px 1fr",
                      gap: 16,
                      alignItems: "start",
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    {/* Image */}
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

                    {/* Content */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div>
                          <h4 style={{ margin: 0, fontSize: "1rem" }}>
                            {it.product_name}
                          </h4>
                          <div
                            className="muted"
                            style={{ marginTop: 4, fontSize: "0.875rem" }}
                          >
                            Size: {it.size} | Color: {it.color} <br />
                            <span
                              style={{
                                color: it.quantity > it.stock ? "red" : "green",
                                fontSize: "0.75rem",
                              }}
                            >
                              (In Stock: {it.stock})
                            </span>
                          </div>
                        </div>
                        <strong style={{ fontSize: "1rem" }}>
                          ${(it.price * it.quantity).toFixed(2)}
                        </strong>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 12,
                        }}
                      >
                        <button
                          className="btn btn-outline"
                          onClick={() => decreaseQty(it)}
                          disabled={it.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>

                        <div
                          style={{
                            minWidth: 30,
                            textAlign: "center",
                            fontWeight: 600,
                          }}
                        >
                          {it.quantity}
                        </div>

                        <button
                          className="btn btn-outline"
                          onClick={() => increaseQty(it)}
                          disabled={it.quantity >= it.stock}
                        >
                          <Plus size={14} />
                        </button>

                        <button
                          className="btn btn-outline"
                          style={{
                            marginLeft: "auto",
                            color: "#ef4444",
                            borderColor: "#fee2e2",
                          }}
                          onClick={() => handleRemove(it.id)}
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
                  height: "fit-content",
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

                  <hr style={{ margin: "12px 0", borderColor: "#e5e7eb" }} />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                    }}
                  >
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>

                  <button
                    className="btn btn-primary btn-lg"
                    style={{
                      marginTop: 16,
                      width: "100%",
                      opacity: loading ? 0.7 : 1,
                    }}
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Checkout"}
                  </button>
                </div>

                <div style={{ marginTop: 24 }}>
                  <p
                    style={{
                      marginBottom: 8,
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    Payment methods
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span
                      className="badge"
                      style={{
                        background: "#f1f5f9",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: "0.75rem",
                      }}
                    >
                      Visa
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: "#f1f5f9",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: "0.75rem",
                      }}
                    >
                      Mastercard
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: "#f1f5f9",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: "0.75rem",
                      }}
                    >
                      PayPal
                    </span>
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