import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

import {
  createOrder,
  addOrderItem,
  updateProductStock,
  deleteCartItem,
  updateCartItem,
} from "../../utilities/api";

export default function CartPage() {
  const { cartItems, totalPrice, removeFromCart, clearCart, fetchCart } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [updatingIds, setUpdatingIds] = useState([]);

  const subtotal = Number(totalPrice) || 0;
  const shipping = cartItems.length > 0 ? 10 : 0;
  const tax = subtotal * 0.08;
  const finalTotal = subtotal + shipping + tax;

  // --- HANDLERS ---

  const handleUpdateQuantity = async (variantId, newQuantity, currentStock) => {
    if (newQuantity < 1) return;
    if (newQuantity > currentStock) {
      alert(`Only ${currentStock} items left in stock!`);
      return;
    }

    if (updatingIds.includes(variantId)) return;
    setUpdatingIds((prev) => [...prev, variantId]);

    try {
      await updateCartItem(variantId, newQuantity);

      if (fetchCart) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== variantId));
    }
  };

  const increaseQty = (item) => {
    handleUpdateQuantity(item.variant_id, item.quantity + 1, item.stock);
  };

  const decreaseQty = (item) => {
    handleUpdateQuantity(item.variant_id, item.quantity - 1, item.stock);
  };

  const handleRemoveItem = async (variantId) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return;
    try {
      await deleteCartItem(variantId);
      removeFromCart(variantId);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      alert("Please log in first!");
      navigate("/login");
      return;
    }
    if (cartItems.length === 0) return;

    // 1. Enter shipping address (REQUIRED - Rust does not allow null)
    let address = prompt("Enter shipping address:", "123 ABC Street");
    if (!address || address.trim() === "") {
      alert("Shipping address cannot be empty!");
      return;
    }

    if (!window.confirm("Confirm placing the order?")) return;
    setLoading(true);

    try {
      // 2. DEBUG CART DATA
      console.log("🔍 Raw cartItems data:", cartItems);

      // 3. NORMALIZE DATA (Most important)
      const itemsPayload = cartItems.map((item) => {
        const vId = item.variant_id || item.id || item.product_variant_id;

        return {
          product_variant_id: parseInt(vId),
          quantity: parseInt(item.quantity),
        };
      });

      const invalidItem = itemsPayload.find(
        (i) => isNaN(i.product_variant_id) || isNaN(i.quantity)
      );
      if (invalidItem) {
        console.error("Invalid item data:", invalidItem);
        alert(
          "Data error: Product ID not found. Please open DevTools (F12) to check the console."
        );
        setLoading(false);
        return;
      }

      const orderData = {
        payment_method: "Cod",
        shipping_address: address,
        items: itemsPayload,
      };

      console.log(
        "📤 FINAL PAYLOAD SENT:",
        JSON.stringify(orderData, null, 2)
      );

      const newOrder = await createOrder(orderData);
      console.log("✅ Success:", newOrder);

      // 6. Clear cart
      await Promise.all(
        cartItems.map(async (item) => {
          try {
            const vId = item.variant_id || item.id;
            if (vId) {
              await updateProductStock(vId, item.stock - item.quantity);
              await deleteCartItem(vId);
            }
          } catch (e) {}
        })
      );

      if (clearCart) clearCart();
      else cartItems.forEach((item) => removeFromCart(item.variant_id));

      alert("Order placed successfully!");
      navigate("/orders");
    } catch (error) {
      console.error("Checkout error:", error);
      if (error.response) {
        console.log("🔥 Response Data:", error.response.data);
        alert(
          `Server Error (${error.response.status}): ${JSON.stringify(
            error.response.data
          )}`
        );
      } else {
        alert("Connection error.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <section
        className="container"
        style={{ padding: "60px 0", textAlign: "center" }}
      >
        <div
          style={{
            background: "#f8fafc",
            padding: 40,
            borderRadius: 12,
            maxWidth: 500,
            margin: "0 auto",
          }}
        >
          <ShoppingBag size={64} color="#94a3b8" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 24, marginBottom: 10 }}>
            Your cart is empty
          </h2>
          <p className="muted" style={{ marginBottom: 24 }}>
            Add some items you love to get started.
          </p>
          <Link to="/" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div
        className="breadcrumb"
        style={{ background: "#f8f9fa", padding: "12px 0" }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
          }}
        >
          <Link to="/" style={{ textDecoration: "none", color: "#666" }}>
            Home
          </Link>
          <ChevronRight size={14} color="#999" />
          <span style={{ fontWeight: 500 }}>Cart</span>
        </div>
      </div>

      <section className="container" style={{ padding: "30px 0 60px" }}>
        <h1 style={{ marginBottom: 8, fontSize: 28 }}>Your Shopping Cart</h1>
        <p className="muted" style={{ marginBottom: 30 }}>
          {cartItems.length} items · Free returns within 30 days
        </p>

        <div
          className="cart-grid-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 30,
            alignItems: "start",
          }}
        >
          {/* LEFT: LIST ITEMS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {cartItems.map((it) => (
              <div
                key={it.id}
                style={{
                  display: "flex",
                  gap: 16,
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 16,
                  background: "#fff",
                }}
              >
                <div style={{ width: 100, height: 100, flexShrink: 0 }}>
                  <img
                    src={it.image || "https://placehold.co/100"}
                    alt={it.product_name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 8,
                      background: "#f1f1f1",
                    }}
                    onError={(e) => {
                      e.target.src = "https://placehold.co/100?text=Error";
                    }}
                  />
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 4px", fontSize: "16px" }}>
                        {it.product_name}
                      </h4>
                      <p
                        className="muted"
                        style={{ fontSize: "13px", margin: 0 }}
                      >
                        Size: <b>{it.size}</b> | Color: <b>{it.color}</b>
                      </p>
                      {it.quantity >= it.stock && (
                        <span
                          style={{
                            color: "#dc2626",
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                        >
                          (Only {it.stock} left in stock)
                        </span>
                      )}
                    </div>
                    <strong style={{ fontSize: "16px" }}>
                      ${(it.price * it.quantity).toFixed(2)}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid #ddd",
                        borderRadius: 6,
                      }}
                    >
                      <button
                        onClick={() => decreaseQty(it)}
                        disabled={it.quantity <= 1}
                        style={{
                          border: "none",
                          background: "none",
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                      >
                        <Minus size={14} />
                      </button>

                      <span
                        style={{
                          minWidth: 24,
                          textAlign: "center",
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        {it.quantity}
                      </span>

                      <button
                        onClick={() => increaseQty(it)}
                        disabled={it.quantity >= it.stock}
                        style={{
                          border: "none",
                          background: "none",
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(it.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 13,
                      }}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div style={{ position: "sticky", top: 20 }}>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 20,
                background: "#fff",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>
                Order Summary
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  fontSize: 15,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="muted">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="muted">Shipping</span>
                  <span>
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="muted">Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <hr style={{ margin: "10px 0", borderColor: "#eee" }} />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                  }}
                >
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{
                  marginTop: 24,
                  width: "100%",
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Processing..." : "Checkout"}
              </button>

              <div style={{ marginTop: 24 }}>
                <p
                  style={{
                    marginBottom: 10,
                    fontWeight: 600,
                    fontSize: "13px",
                    color: "#666",
                  }}
                >
                  Accepted payment methods
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Visa", "Mastercard", "PayPal"].map((pm) => (
                    <span
                      key={pm}
                      style={{
                        background: "#f1f5f9",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        color: "#475569",
                        fontWeight: 500,
                      }}
                    >
                      {pm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
