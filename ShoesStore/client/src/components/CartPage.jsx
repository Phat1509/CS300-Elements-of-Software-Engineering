<<<<<<< HEAD
import { Button } from "./ui/button";
import { ChevronRight, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Separator } from "./ui/separator";
=======
// src/components/CartPage.jsx
import React, { useState } from "react";
import { ChevronRight, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
>>>>>>> origin/Khoa

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Premium Running Shoes",
      price: 129.99,
<<<<<<< HEAD
      image: "https://images.unsplash.com/photo-1719523677291-a395426c1a87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBwcm9kdWN0fGVufDF8fHx8MTc2MTA2NzQyN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
=======
      image:
        "https://images.unsplash.com/photo-1719523677291-a395426c1a87?w=1080&q=80",
>>>>>>> origin/Khoa
      size: "9",
      quantity: 1,
    },
    {
      id: 2,
<<<<<<< HEAD
      name: "Urban Casual Sneakers",
      price: 99.99,
      image: "https://images.unsplash.com/photo-1759542890353-35f5568c1c90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBzbmVha2Vyc3xlbnwxfHx8fDE3NjExNjQ3OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      size: "10",
      quantity: 2,
    },
    {
      id: 3,
      name: "Classic White Sneaker",
      price: 74.99,
      image: "https://images.unsplash.com/photo-1631482665588-d3a6f88e65f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmVha2VycyUyMHByb2R1Y3QlMjB3aGl0ZXxlbnwxfHx8fDE3NjExOTAyMDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      size: "8.5",
      quantity: 1,
    },
  ]);

  const updateQuantity = (id, delta) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
=======
      name: "Street Classic",
      price: 89.99,
      image:
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1080&q=80",
      size: "8",
      quantity: 2,
    },
  ]);

  const subtotal = cartItems.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );
  const shipping = cartItems.length > 0 ? 5 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const changeQty = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((it) =>
          it.id === id
            ? { ...it, quantity: Math.max(1, it.quantity + delta) }
            : it
        )
        .filter((it) => it.quantity > 0)
>>>>>>> origin/Khoa
    );
  };

  const removeItem = (id) => {
<<<<<<< HEAD
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 10 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <>
      {/* Breadcrumb */}
      <section className="bg-slate-50 py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary transition-colors">
              Home
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Shopping Cart</span>
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <h1 className="!font-bold mb-8">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Add some items to your cart to get started
              </p>
              <Button>Continue Shopping</Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg p-6 flex gap-6"
                  >
                    <div className="w-24 h-24 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <h4 className="!font-medium mb-1">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Size: {item.size}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="!font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
=======
    setCartItems((prev) => prev.filter((it) => it.id !== id));
  };

  const FallbackImg = ({ src, alt }) => (
    <img
      src={src}
      alt={alt}
      onError={(e) => {
        e.currentTarget.src =
          "https://via.placeholder.com/120x120.png?text=No+Image";
      }}
      style={{
        width: 96,
        height: 96,
        objectFit: "cover",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
      }}
    />
  );

  const Separator = () => (
    <div style={{ height: 1, background: "#e5e7eb", margin: "16px 0" }} />
  );

  return (
    <>
      {/* breadcrumb */}
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
            <h3 style={{ marginTop: 12, marginBottom: 8 }}>Your cart is empty</h3>
            <p className="muted" style={{ marginBottom: 16 }}>
              Start exploring our latest collections.
            </p>
            <a href="/" className="btn btn-primary">
              Continue Shopping
            </a>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 24,
              gridTemplateColumns: "1fr",
            }}
          >
            {/* grid 2 cột trên desktop */}
            <div
              style={{
                display: "grid",
                gap: 24,
                gridTemplateColumns: "1fr",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gap: 16,
                  gridTemplateColumns: "1fr",
                }}
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
                    <FallbackImg src={it.image} alt={it.name} />

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
                          <div className="muted" style={{ marginTop: 4 }}>
                            Size: {it.size}
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
                        <button
                          className="btn btn-outline"
                          onClick={() => changeQty(it.id, -1)}
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
                          onClick={() => changeQty(it.id, +1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>

                        <button
                          className="btn btn-outline"
                          style={{ marginLeft: "auto" }}
                          onClick={() => removeItem(it.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
>>>>>>> origin/Khoa
                      </div>
                    </div>
                  </div>
                ))}
              </div>

<<<<<<< HEAD
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6 sticky top-20">
                  <h3 className="!font-semibold mb-6">Order Summary</h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="!font-semibold">Total</span>
                      <span className="!font-bold">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button className="w-full mb-4" size="lg">
                    Proceed to Checkout
                  </Button>
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>

                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      We accept:
                    </p>
                    <div className="flex gap-2">
                      <div className="h-8 px-3 bg-slate-100 rounded flex items-center justify-center text-xs">
                        Visa
                      </div>
                      <div className="h-8 px-3 bg-slate-100 rounded flex items-center justify-center text-xs">
                        Mastercard
                      </div>
                      <div className="h-8 px-3 bg-slate-100 rounded flex items-center justify-center text-xs">
                        PayPal
                      </div>
                    </div>
=======
              {/* Summary */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>Order Summary</h3>
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span className="muted">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span className="muted">Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span className="muted">Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <Separator />

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

                  <button className="btn btn-primary btn-lg" style={{ marginTop: 12 }}>
                    Checkout
                  </button>

                  <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                    By placing your order, you agree to our Terms &amp; Conditions and
                    Privacy Policy.
                  </p>
                </div>

                <Separator />

                <div>
                  <p style={{ marginBottom: 8, fontWeight: 600 }}>Payment methods</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <div className="badge">Visa</div>
                    <div className="badge">Mastercard</div>
                    <div className="badge">Apple Pay</div>
                    <div className="badge">PayPal</div>
>>>>>>> origin/Khoa
                  </div>
                </div>
              </div>
            </div>
<<<<<<< HEAD
          )}
        </div>
=======
          </div>
        )}
>>>>>>> origin/Khoa
      </section>
    </>
  );
}
