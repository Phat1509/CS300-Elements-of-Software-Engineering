import React from "react";

export default function ProductCard({ image, name, price, extra }) {
  return (
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
}
