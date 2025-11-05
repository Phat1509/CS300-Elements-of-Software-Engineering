// src/components/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ id, image, name, price, extra }) {
  const CardInner = (
    <div className="card">
      <img className="card-img" src={image} alt={name} />
      <div className="card-body">
        <h4 className="card-title">{name}</h4>
        <div className="card-row">
          <span className="price">${price}</span>
          {extra ? <span className="pill-sm">{extra}</span> : null}
        </div>
      </div>
    </div>
  );

 
  return id ? <Link to={`/product/${id}`}>{CardInner}</Link> : CardInner;
}
