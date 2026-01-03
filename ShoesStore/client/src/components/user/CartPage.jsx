// client/src/components/user/CartPage.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChevronRight, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { updateQuantity, removeItem, clearCart } from "../../actions/cart";

export default function CartPage() {
  const dispatch = useDispatch();

  const items = useSelector((state) => state.cart.items);

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shipping = items.length > 0 ? 10 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const increaseQty = (item) => {
    dispatch(updateQuantity(item.id, item.quantity + 1));
  };

  const decreaseQty = (item) => {
    if (item.quantity > 1) {
      dispatch(updateQuantity(item.id, item.quantity - 1));
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    // For now, do not write to db.json from client. Checkout will clear local cart only.
    dispatch(clearCart());
    alert("Checkout simulated locally. Admin will process orders.");
  };

  const handleRemove = (id) => {
    dispatch(removeItem(id));
  };

  const handleClear = () => {
    dispatch(clearCart());
  };

  return (
    <>
      <section className="men-bc">
        <div className="container" style={{ display: "flex", gap: 8 }}>
          <a href="/" className="men-bc-link">
            Home
          </a>
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
          {items.length} item(s) · Free returns within 30 days
        </p>

        {items.length === 0 ? (
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
            <a href="/" className="btn btn-primary">
              Continue Shopping
            </a>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr" }}>
            <div
              style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr" }}
            >
              <div
                style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr" }}
              >
                {items.map((it) => (
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
                    <img
                      src={it.image}
                      alt={it.name}
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
                          <h4 style={{ margin: 0 }}>{it.name}</h4>
                          {it.size && (
                            <div className="muted" style={{ marginTop: 4 }}>
                              Size: {it.size}
                            </div>
                          )}
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
                        <button
                          className="btn btn-outline"
                          onClick={() => decreaseQty(it)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <div
                          style={{
                            minWidth: 40,
                            textAlign: "center",
                            fontWeight: 700,
                          }}
                        >
                          {it.quantity}
                        </div>
                        <button
                          className="btn btn-outline"
                          onClick={() => increaseQty(it)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ marginLeft: "auto" }}
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
                    }}
                  >
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  <button
                    className="btn btn-primary btn-lg"
                    style={{ marginTop: 12 }}
                    onClick={handleCheckout}
                  >
                    Checkout
                  </button>
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={handleClear}
                  >
                    Clear Cart
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
