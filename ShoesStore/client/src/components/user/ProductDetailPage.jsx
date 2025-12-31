import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  getProductDetail,
  addToCart,
  getCartByUserId
} from "../../ultilities/api";

const ProductDetail = () => {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);

  // MOCK user (sau này lấy từ auth)
  const userId = 2;

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const data = await getProductDetail(slug);
      if (!data) return;

      setProduct(data);
      setVariants(data.variants || []);

      // lấy cart user
      const cart = await getCartByUserId(userId);
      if (cart) setCartId(cart.cart_id);

      setLoading(false);
    };

    fetchData();
  }, [slug]);

  /* ================= OPTIONS ================= */
  const sizes = useMemo(() => {
    return [...new Set(variants.map((v) => v.size).filter(Boolean))];
  }, [variants]);

  const colors = useMemo(() => {
    return [...new Set(variants.map((v) => v.color).filter(Boolean))];
  }, [variants]);

  /* ================= SELECTED VARIANT ================= */
  const selectedVariant = useMemo(() => {
    return variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
  }, [variants, selectedSize, selectedColor]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert("Please select size and color");
      return;
    }

    if (selectedVariant.stock < quantity) {
      alert("Not enough stock");
      return;
    }

    await addToCart({
      cartId,
      variantId: selectedVariant.variant_id,
      quantity
    });

    alert("Added to cart successfully");
  };

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className="product-detail">
      {/* IMAGE */}
      <div className="product-image">
        <img src={product.image_url} alt={product.name} />
      </div>

      {/* INFO */}
      <div className="product-info">
        <h1>{product.name}</h1>

        <p className="price">
          {product.discount_percentage ? (
            <>
              <span className="old-price">
                {product.price.toLocaleString()}₫
              </span>
              <span className="new-price">
                {(
                  product.price *
                  (1 - product.discount_percentage / 100)
                ).toLocaleString()}
                ₫
              </span>
            </>
          ) : (
            <span>{product.price.toLocaleString()}₫</span>
          )}
        </p>

        <p className="description">{product.description}</p>

        {/* SIZE */}
        <div className="option">
          <label>Size</label>
          <div className="option-list">
            {sizes.map((size) => (
              <button
                key={size}
                className={selectedSize === size ? "active" : ""}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* COLOR */}
        <div className="option">
          <label>Color</label>
          <div className="option-list">
            {colors.map((color) => (
              <button
                key={color}
                className={selectedColor === color ? "active" : ""}
                onClick={() => setSelectedColor(color)}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* STOCK */}
        {selectedVariant && (
          <p className="stock">
            Stock: {selectedVariant.stock}
          </p>
        )}

        {/* QUANTITY */}
        <div className="quantity">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            -
          </button>
          <span>{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>

        {/* ADD TO CART */}
        <button
          className="add-to-cart"
          disabled={!selectedVariant || selectedVariant.stock === 0}
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
