// src/components/CartPage.jsx
// import React, { useState } from "react";
// import { ChevronRight, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

// export default function CartPage() {
//   const [cartItems, setCartItems] = useState([
//     {
//       id: 1,
//       name: "Premium Running Shoes",
//       price: 129.99,
//       image:
//         "https://images.unsplash.com/photo-1719523677291-a395426c1a87?w=1080&q=80",
//       size: "9",
//       quantity: 1,
//     },
//     {
//       id: 2,
//       name: "Street Classic",
//       price: 89.99,
//       image:
//         "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1080&q=80",
//       size: "8",
//       quantity: 2,
//     },
//   ]);

//   const subtotal = cartItems.reduce(
//     (sum, it) => sum + it.price * it.quantity,
//     0
//   );
//   const shipping = cartItems.length > 0 ? 5 : 0;
//   const tax = subtotal * 0.08;
//   const total = subtotal + shipping + tax;

//   const changeQty = (id, delta) => {
//     setCartItems((prev) =>
//       prev
//         .map((it) =>
//           it.id === id
//             ? { ...it, quantity: Math.max(1, it.quantity + delta) }
//             : it
//         )
//         .filter((it) => it.quantity > 0)
//     );
//   };

//   const removeItem = (id) => {
//     setCartItems((prev) => prev.filter((it) => it.id !== id));
//   };

//   const FallbackImg = ({ src, alt }) => (
//     <img
//       src={src}
//       alt={alt}
//       onError={(e) => {
//         e.currentTarget.src =
//           "https://via.placeholder.com/120x120.png?text=No+Image";
//       }}
//       style={{
//         width: 96,
//         height: 96,
//         objectFit: "cover",
//         borderRadius: 12,
//         border: "1px solid #e5e7eb",
//       }}
//     />
//   );

//   const Separator = () => (
//     <div style={{ height: 1, background: "#e5e7eb", margin: "16px 0" }} />
//   );

//   return (
//     <>
//       {/* breadcrumb */}
//       <section className="men-bc">
//         <div className="container" style={{ display: "flex", gap: 8 }}>
//           <a href="/" className="men-bc-link">
//             Home
//           </a>
//           <span className="men-bc-sep">
//             <ChevronRight size={16} />
//           </span>
//           <span>Cart</span>
//         </div>
//       </section>

//       <section className="container" style={{ padding: "24px 0 40px" }}>
//         <h1 className="men-title" style={{ marginBottom: 8 }}>
//           Your Cart
//         </h1>
//         <p className="muted" style={{ marginBottom: 24 }}>
//           {cartItems.length} item(s) · Free returns within 30 days
//         </p>

//         {cartItems.length === 0 ? (
//           <div
//             style={{
//               border: "1px solid #e5e7eb",
//               borderRadius: 12,
//               padding: 24,
//               textAlign: "center",
//               background: "#f8fafc",
//             }}
//           >
//             <ShoppingBag className="h-16 w-16 mx-auto" />
//             <h3 style={{ marginTop: 12, marginBottom: 8 }}>Your cart is empty</h3>
//             <p className="muted" style={{ marginBottom: 16 }}>
//               Start exploring our latest collections.
//             </p>
//             <a href="/" className="btn btn-primary">
//               Continue Shopping
//             </a>
//           </div>
//         ) : (
//           <div
//             style={{
//               display: "grid",
//               gap: 24,
//               gridTemplateColumns: "1fr",
//             }}
//           >
//             {/* grid 2 cột trên desktop */}
//             <div
//               style={{
//                 display: "grid",
//                 gap: 24,
//                 gridTemplateColumns: "1fr",
//               }}
//             >
//               <div
//                 style={{
//                   display: "grid",
//                   gap: 16,
//                   gridTemplateColumns: "1fr",
//                 }}
//               >
//                 {cartItems.map((it) => (
//                   <div
//                     key={it.id}
//                     style={{
//                       display: "grid",
//                       gridTemplateColumns: "96px 1fr auto",
//                       gap: 16,
//                       alignItems: "center",
//                       border: "1px solid #e5e7eb",
//                       borderRadius: 12,
//                       padding: 12,
//                     }}
//                   >
//                     <FallbackImg src={it.image} alt={it.name} />

//                     <div>
//                       <div
//                         style={{
//                           display: "flex",
//                           justifyContent: "space-between",
//                           gap: 12,
//                         }}
//                       >
//                         <div>
//                           <h4 style={{ margin: 0 }}>{it.name}</h4>
//                           <div className="muted" style={{ marginTop: 4 }}>
//                             Size: {it.size}
//                           </div>
//                         </div>
//                         <strong>${it.price.toFixed(2)}</strong>
//                       </div>

//                       <div
//                         style={{
//                           display: "flex",
//                           alignItems: "center",
//                           gap: 8,
//                           marginTop: 12,
//                         }}
//                       >
//                         <button
//                           className="btn btn-outline"
//                           onClick={() => changeQty(it.id, -1)}
//                           aria-label="Decrease quantity"
//                         >
//                           <Minus size={16} />
//                         </button>
//                         <div
//                           style={{
//                             minWidth: 40,
//                             textAlign: "center",
//                             fontWeight: 700,
//                           }}
//                         >
//                           {it.quantity}
//                         </div>
//                         <button
//                           className="btn btn-outline"
//                           onClick={() => changeQty(it.id, +1)}
//                           aria-label="Increase quantity"
//                         >
//                           <Plus size={16} />
//                         </button>

//                         <button
//                           className="btn btn-outline"
//                           style={{ marginLeft: "auto" }}
//                           onClick={() => removeItem(it.id)}
//                           aria-label="Remove item"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Summary */}
//               <div
//                 style={{
//                   border: "1px solid #e5e7eb",
//                   borderRadius: 12,
//                   padding: 16,
//                 }}
//               >
//                 <h3 style={{ marginTop: 0, marginBottom: 12 }}>Order Summary</h3>
//                 <div
//                   style={{
//                     display: "grid",
//                     gap: 8,
//                   }}
//                 >
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                     }}
//                   >
//                     <span className="muted">Subtotal</span>
//                     <span>${subtotal.toFixed(2)}</span>
//                   </div>
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                     }}
//                   >
//                     <span className="muted">Shipping</span>
//                     <span>${shipping.toFixed(2)}</span>
//                   </div>
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                     }}
//                   >
//                     <span className="muted">Tax (8%)</span>
//                     <span>${tax.toFixed(2)}</span>
//                   </div>

//                   <Separator />

//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       fontWeight: 800,
//                     }}
//                   >
//                     <span>Total</span>
//                     <span>${total.toFixed(2)}</span>
//                   </div>

//                   <button className="btn btn-primary btn-lg" style={{ marginTop: 12 }}>
//                     Checkout
//                   </button>

//                   <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
//                     By placing your order, you agree to our Terms &amp; Conditions and
//                     Privacy Policy.
//                   </p>
//                 </div>

//                 <Separator />

//                 <div>
//                   <p style={{ marginBottom: 8, fontWeight: 600 }}>Payment methods</p>
//                   <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//                     <div className="badge">Visa</div>
//                     <div className="badge">Mastercard</div>
//                     <div className="badge">Apple Pay</div>
//                     <div className="badge">PayPal</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </section>
//     </>
//   );
// }