// src/components/ProductCard.jsx
import { useSelector, useDispatch } from "react-redux";
import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { addToCart, updateQuantity } from "../actions/cart.js";

export default function ProductCard({ id, image, name, price, extra }) {
  const cart = useSelector((state) => state.cart.items);

  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ id, name, price, image, quantity: 1 }));
  };

  const CardInner = (
    <div className="card">
      <img className="card-img" src={image} alt={name} />
      <div className="card-body">
        <h4 className="card-title">{name}</h4>

        <div className="card-row">
          <span className="price">${price}</span>
          {extra && <span className="pill-sm">{extra}</span>}
        </div>

        {/* --- ADD TO CART BUTTON --- */}
        <button className="btn btn-primary pd-add" onClick={handleAddToCart}>
          <ShoppingCart size={18} /> Add to Cart
        </button>
      </div>
    </div>
  );

  return id ? <Link to={`/product/${id}`}>{CardInner}</Link> : CardInner;
}
