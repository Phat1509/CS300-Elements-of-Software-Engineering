<<<<<<< HEAD
import { useState } from "react";
import { Heart, ShoppingCart, Star, Truck, RotateCcw, Shield, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Separator } from "./ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { ProductCard } from "./ProductCard";

// Mock product data
=======
// src/components/ProductDetailPage.jsx
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star, Truck, RotateCcw, Shield, ChevronLeft } from "lucide-react";

// (mock) dữ liệu mẫu – tạm thời hiển thị chi tiết cố định
>>>>>>> origin/Khoa
const productData = {
  id: 1,
  name: "Air Max Pro Running Shoes",
  category: "Men's Running Shoes",
  price: 159.99,
  originalPrice: 199.99,
  discount: 20,
  rating: 4.8,
  reviews: 342,
  isNew: true,
  inStock: true,
<<<<<<< HEAD
  description: "Experience ultimate comfort and performance with the Air Max Pro Running Shoes. Engineered with cutting-edge cushioning technology and breathable materials, these shoes are perfect for both casual runs and intense training sessions.",
=======
  description:
    "Experience ultimate comfort and performance with the Air Max Pro Running Shoes. Engineered with cutting-edge cushioning technology and breathable materials, these shoes are perfect for both casual runs and intense training sessions.",
>>>>>>> origin/Khoa
  features: [
    "Premium breathable mesh upper for maximum ventilation",
    "Advanced cushioning technology for superior comfort",
    "Durable rubber outsole with multi-directional traction",
    "Lightweight design for enhanced performance",
<<<<<<< HEAD
    "Padded collar and tongue for added support"
  ],
  sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
  colors: [
    { name: "White/Blue", value: "#ffffff", image: "https://images.unsplash.com/photo-1717664644983-fa919d287460?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWtlJTIwc25lYWtlcnMlMjB3aGl0ZXxlbnwxfHx8fDE3NjIyNTYwNzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Black/Red", value: "#1a1a1a", image: "https://images.unsplash.com/photo-1690794250228-ec42fe151e28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBzaWRlJTIwdmlld3xlbnwxfHx8fDE3NjIzMjcxMzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Navy/White", value: "#1e3a8a", image: "https://images.unsplash.com/photo-1614232296132-8e2b98031ab2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMHNob2VzJTIwZGV0YWlsfGVufDF8fHx8MTc2MjMyNzEzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Grey/Orange", value: "#6b7280", image: "https://images.unsplash.com/photo-1633464130613-0a9154299ac2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzbmVha2VycyUyMHRvcHxlbnwxfHx8fDE3NjIzMjcxMzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
  ],
  specifications: {
    "Brand": "SneakerHub",
    "Model": "Air Max Pro",
    "Material": "Mesh & Synthetic",
    "Sole Material": "Rubber",
    "Closure Type": "Lace-up",
    "Fit Type": "Regular"
  }
};

// Related products mock data
const relatedProducts = [
  {
    id: 2,
    name: "CloudFit Training Shoes",
    category: "Men's Training",
    price: 129.99,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    rating: 4.6,
    reviews: 234,
    isNew: false,
    discount: null
  },
  {
    id: 3,
    name: "Sprint Elite Runner",
    category: "Men's Running",
    price: 149.99,
    originalPrice: 179.99,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800",
    rating: 4.7,
    reviews: 189,
    isNew: true,
    discount: 17
  },
  {
    id: 4,
    name: "Urban Street Sneakers",
    category: "Men's Casual",
    price: 99.99,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
    rating: 4.5,
    reviews: 567,
    isNew: false,
    discount: null
  },
  {
    id: 5,
    name: "Performance Plus",
    category: "Men's Running",
    price: 139.99,
    originalPrice: 169.99,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
    rating: 4.8,
    reviews: 423,
    isNew: false,
    discount: 18
  }
];

export default function ProductDetailPage({ onNavigate }) {
=======
    "Padded collar and tongue for added support",
  ],
  sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
  colors: [
    { name: "White/Blue", value: "#ffffff", image: "https://images.unsplash.com/photo-1717664644983-fa919d287460?q=80&w=1080&auto=format&fit=crop" },
    { name: "Black/Red", value: "#1a1a1a", image: "https://images.unsplash.com/photo-1690794250228-ec42fe151e28?q=80&w=1080&auto=format&fit=crop" },
    { name: "Navy/White", value: "#1e3a8a", image: "https://images.unsplash.com/photo-1614232296132-8e2b98031ab2?q=80&w=1080&auto=format&fit=crop" },
    { name: "Grey/Orange", value: "#6b7280", image: "https://images.unsplash.com/photo-1633464130613-0a9154299ac2?q=80&w=1080&auto=format&fit=crop" },
  ],
  specifications: {
    Brand: "SneakerHub",
    Model: "Air Max Pro",
    Material: "Mesh & Synthetic",
    "Sole Material": "Rubber",
    "Closure Type": "Lace-up",
    "Fit Type": "Regular",
  },
};

export default function ProductDetailPage() {
  const { id } = useParams(); // tạm chưa dùng – có thể load đúng sp theo id sau
  const navigate = useNavigate();
>>>>>>> origin/Khoa
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(productData.colors[0].image);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleColorChange = (index) => {
    setSelectedColor(index);
    setMainImage(productData.colors[index].image);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    alert(`Added ${quantity} item(s) to cart - Size: ${selectedSize}`);
  };

<<<<<<< HEAD
  const handleQuantityChange = (type) => {
    if (type === "increase") {
      setQuantity(prev => prev + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => onNavigate("home")}
                  className="cursor-pointer"
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => onNavigate("men")}
                  className="cursor-pointer"
                >
                  Men
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{productData.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Back Button - Mobile */}
      <div className="lg:hidden border-b">
        <div className="container mx-auto px-4 py-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate("men")}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>

      {/* Product Detail Section */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={mainImage}
                alt={productData.name}
                className="w-full h-full object-cover"
              />
              {productData.isNew && (
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                  New Arrival
                </Badge>
              )}
              {productData.discount && (
                <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                  -{productData.discount}%
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {productData.colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleColorChange(index)}
                  className={`relative aspect-square bg-slate-100 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedColor === index 
                      ? "border-primary shadow-md" 
                      : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <ImageWithFallback
                    src={color.image}
                    alt={color.name}
                    className="w-full h-full object-cover"
                  />
=======
  return (
    <div className="pd">
      {/* breadcrumb */}
      <div className="pd-bc">
        <div className="container pd-bc-in">
          <Link to="/" className="pd-bc-link">Home</Link>
          <span className="pd-bc-sep">›</span>
          <Link to="/men" className="pd-bc-link">Men</Link>
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
            {productData.isNew && <span className="pd-badge pd-badge-new">New Arrival</span>}
            {productData.discount && <span className="pd-badge pd-badge-off">-{productData.discount}%</span>}
          </div>

          <div className="pd-thumbs">
            {productData.colors.map((c, i) => (
              <button
                key={c.name}
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
              <Star key={i} size={16} className={i < Math.floor(productData.rating) ? "star on" : "star"} />
            ))}
            <span className="pd-rating-text">
              {productData.rating} ({productData.reviews} reviews)
            </span>
          </div>
          <p className="muted">{productData.category}</p>

          <div className="pd-price">
            <strong>${productData.price}</strong>
            {productData.originalPrice && <span className="strike">${productData.originalPrice}</span>}
            {productData.discount && (
              <span className="save">Save ${(productData.originalPrice - productData.price).toFixed(2)}</span>
            )}
          </div>

          <hr className="pd-sep" />

          {/* Color */}
          <div className="pd-block">
            <div className="pd-row">
              <span className="pd-label">Color</span>
              <span className="muted">{productData.colors[selectedColor].name}</span>
            </div>
            <div className="pd-colors">
              {productData.colors.map((c, i) => (
                <button
                  key={c.name}
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
>>>>>>> origin/Khoa
                </button>
              ))}
            </div>
          </div>

<<<<<<< HEAD
          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div className="space-y-3">
              <h1 className="!font-bold">{productData.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(productData.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-slate-200 text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm">
                  {productData.rating} ({productData.reviews} reviews)
                </span>
              </div>
              <p className="text-muted-foreground">{productData.category}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="!font-bold">${productData.price}</span>
              {productData.originalPrice && (
                <span className="text-muted-foreground line-through">
                  ${productData.originalPrice}
                </span>
              )}
              {productData.discount && (
                <span className="text-green-600">
                  Save ${(productData.originalPrice - productData.price).toFixed(2)}
                </span>
              )}
            </div>

            <Separator />

            {/* Color Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="!font-medium">Color</span>
                <span className="text-sm text-muted-foreground">
                  {productData.colors[selectedColor].name}
                </span>
              </div>
              <div className="flex gap-2">
                {productData.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorChange(index)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === index
                        ? "border-primary scale-110 shadow-md"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="!font-medium">Select Size</span>
                <button className="text-sm text-primary hover:underline">
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {productData.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 border rounded-lg transition-all ${
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-slate-300 hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <span className="!font-medium">Quantity</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => handleQuantityChange("decrease")}
                    className="px-4 py-2 hover:bg-slate-100 transition-colors"
                    disabled={quantity === 1}
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange("increase")}
                    className="px-4 py-2 hover:bg-slate-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                {productData.inStock ? (
                  <span className="text-sm text-green-600">In Stock</span>
                ) : (
                  <span className="text-sm text-destructive">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                className="flex-1 gap-2" 
                size="lg"
                onClick={handleAddToCart}
                disabled={!productData.inStock}
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                variant={isWishlisted ? "default" : "outline"}
                size="lg"
                className="gap-2"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
              </Button>
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-4">
              <h3 className="!font-medium">Key Features</h3>
              <ul className="space-y-2">
                {productData.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shipping Info */}
            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <Truck className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <p className="!font-medium">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">
                    On orders over $100
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <RotateCcw className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <p className="!font-medium">30-Day Returns</p>
                  <p className="text-sm text-muted-foreground">
                    Easy returns within 30 days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <p className="!font-medium">2-Year Warranty</p>
                  <p className="text-sm text-muted-foreground">
                    Manufacturer warranty included
                  </p>
                </div>
=======
          {/* Quantity */}
          <div className="pd-block">
            <span className="pd-label">Quantity</span>
            <div className="pd-qty">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity === 1}>
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
            <button className="btn btn-primary pd-add" onClick={handleAddToCart} disabled={!productData.inStock}>
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
>>>>>>> origin/Khoa
              </div>
            </div>
          </div>
        </div>
<<<<<<< HEAD

        {/* Product Description & Specifications */}
        <div className="mt-12 lg:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Description */}
            <div className="space-y-4">
              <h2 className="!font-bold">Product Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {productData.description}
              </p>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h2 className="!font-bold">Specifications</h2>
              <div className="space-y-3">
                {Object.entries(productData.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="!font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16 lg:mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="!font-bold">You May Also Like</h2>
            <Button variant="ghost" onClick={() => onNavigate("men")}>
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <div key={product.id} className="cursor-pointer">
                <ProductCard {...product} />
=======
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
>>>>>>> origin/Khoa
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
