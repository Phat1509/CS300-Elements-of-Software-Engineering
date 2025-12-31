import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  RotateCcw,
  Shield,
  ChevronLeft,
} from "lucide-react";
import { getProductById } from "../../ultilities/api";
import { useDispatch } from "react-redux";
import { addToCart } from "../../actions/cart";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    let mounted = true;
    getProductById(id).then((p) => {
      if (!mounted) return;
      if (!p) return;
      const rawColors = p.colors || [];
      const colors = rawColors.length
        ? rawColors.map((c, idx) => ({
            name: c,
            value: "",
            image:
              (p.images && p.images[idx]) ||
              (p.images && p.images[0]) ||
              p.image,
          }))
        : [
            {
              name: "Default",
              value: "",
              image: (p.images && p.images[0]) || p.image || null,
            },
          ];
      const sizes = Array.isArray(p.sizes) ? p.sizes : [];
      const features = [
        "Lightweight build",
        "Comfort padding",
        "Durable outsole",
      ];
      const specifications = { Brand: p.brand || "-", Price: `$${p.price}` };
      const mapped = {
        id: p.id,
        name: p.name,
        category: p.category || "",
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discountPercent,
        rating: p.rating,
        reviews: p.reviews,
        isNew: p.isNew,
        inStock: Number.isFinite(p.stock) ? p.stock > 0 : true,
        description: p.description,
        features,
        sizes,
        colors,
        specifications,
        images:
          p.images && p.images.length ? p.images : p.image ? [p.image] : [],
      };
      setProductData(mapped);
      setMainImage(mapped.images[0] || (colors[0] && colors[0].image) || null);
      if (sizes.length > 0) setSelectedSize(sizes[0]);
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleColorChange = (index) => {
    setSelectedColor(index);
    if (productData) {
      const colorImage =
        productData.colors &&
        productData.colors[index] &&
        productData.colors[index].image;
      const img =
        colorImage ||
        (productData.images && productData.images[index]) ||
        productData.images[0];
      if (img) setMainImage(img);
    }
  };

  const dispatch = useDispatch();

  const handleAddToCart = () => {
    if (productData.sizes && productData.sizes.length > 0 && !selectedSize) {
      alert("Please select a size");
      return;
    }
    const payload = {
      id: productData.id,
      name: productData.name,
      price: productData.price,
      image: productData.images && productData.images[0],
      size: selectedSize,
      color: productData.colors[selectedColor]?.name || null,
      quantity,
    };
    dispatch(addToCart(payload));
    alert(`Added ${quantity} item(s) to cart - Size: ${selectedSize}`);
  };

  if (!productData) return <div className="container">Loading...</div>;

  return (
    <div className="pd">
      {/* breadcrumb */}
      <div className="pd-bc">
        <div className="container pd-bc-in">
          <Link to="/" className="pd-bc-link">
            Home
          </Link>
          <span className="pd-bc-sep">›</span>
          <Link to="/men" className="pd-bc-link">
            Men
          </Link>
          <span className="pd-bc-sep">›</span>
          <span>{productData.name}</span>
        </div>
      </div>

      {/* back mobile */}
      <div className="container pd-back">
        <button className="btn btn-outline gap-2" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} /> Back to Products
        </button>
      </div>

      {/* main two-columns */}
      <div className="container pd-main">
        {/* left: gallery */}
        <div className="pd-left">
          <div className="pd-mainimg">
            <img src={mainImage} alt={productData.name} />
            {productData.isNew && (
              <span className="pd-badge pd-badge-new">New Arrival</span>
            )}
            {productData.discount && (
              <span className="pd-badge pd-badge-off">
                -{productData.discount}%
              </span>
            )}
          </div>

          <div className="pd-thumbs">
            {productData.colors.map((c, i) => (
              <button
                key={`${c.name}-${i}`}
                onClick={() => handleColorChange(i)}
                className={`pd-thumb ${i === selectedColor ? "active" : ""}`}
              >
                <img src={c.image} alt={c.name} />
              </button>
            ))}
          </div>
        </div>

        {/* right: info */}
        <div className="pd-right">
          <h1 className="pd-title">{productData.name}</h1>
          <div className="pd-rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < Math.floor(productData.rating) ? "star on" : "star"
                }
              />
            ))}
            <span className="pd-rating-text">
              {productData.rating} ({productData.reviews} reviews)
            </span>
          </div>
          <p className="muted">{productData.category}</p>

          <div className="pd-price">
            <strong>${productData.price}</strong>
            {productData.originalPrice && (
              <span className="strike">${productData.originalPrice}</span>
            )}
            {productData.discount && (
              <span className="save">
                Save $
                {(productData.originalPrice - productData.price).toFixed(2)}
              </span>
            )}
          </div>

          <hr className="pd-sep" />

          {/* Color */}
          <div className="pd-block">
            <div className="pd-row">
              <span className="pd-label">Color</span>
              <span className="muted">
                {productData.colors[selectedColor]?.name || ""}
              </span>
            </div>
            <div className="pd-colors">
              {productData.colors.map((c, i) => (
                <button
                  key={`${c.name}-${i}`}
                  title={c.name}
                  onClick={() => handleColorChange(i)}
                  className={`pd-color ${i === selectedColor ? "active" : ""}`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="pd-block">
            <div className="pd-row">
              <span className="pd-label">Select Size</span>
              <button className="link-btn">Size Guide</button>
            </div>
            <div className="pd-sizes">
              {productData.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`pd-size ${selectedSize === s ? "active" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="pd-block">
            <span className="pd-label">Quantity</span>
            <div className="pd-qty">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity === 1}
              >
                –
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              {productData.inStock ? (
                <span className="pd-stock ok">In Stock</span>
              ) : (
                <span className="pd-stock no">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pd-actions">
            <button
              className="btn btn-primary pd-add"
              onClick={handleAddToCart}
              disabled={!productData.inStock}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button
              className={`btn ${isWishlisted ? "btn-primary" : "btn-outline"}`}
              onClick={() => setIsWishlisted((v) => !v)}
              aria-label="Wishlist"
            >
              <Heart size={18} />
            </button>
          </div>

          <hr className="pd-sep" />

          {/* Features */}
          <div className="pd-features">
            <h3>Key Features</h3>
            <ul>
              {productData.features.map((t) => (
                <li key={t}>✓ {t}</li>
              ))}
            </ul>
          </div>

          {/* Shipping/Returns/Warranty */}
          <div className="pd-infos">
            <div className="pd-info">
              <Truck size={18} />
              <div>
                <p className="info-title">Free Shipping</p>
                <p className="muted">On orders over $100</p>
              </div>
            </div>
            <div className="pd-info">
              <RotateCcw size={18} />
              <div>
                <p className="info-title">30-Day Returns</p>
                <p className="muted">Easy returns within 30 days</p>
              </div>
            </div>
            <div className="pd-info">
              <Shield size={18} />
              <div>
                <p className="info-title">2-Year Warranty</p>
                <p className="muted">Manufacturer warranty included</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description + Specs */}
      <div className="container pd-lower">
        <div className="pd-desc">
          <h2>Product Description</h2>
          <p className="muted">{productData.description}</p>
        </div>
        <div className="pd-specs">
          <h2>Specifications</h2>
          <div className="pd-spec-grid">
            {Object.entries(productData.specifications).map(([k, v]) => (
              <div key={k} className="pd-spec-row">
                <span className="muted">{k}</span>
                <span className="val">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
