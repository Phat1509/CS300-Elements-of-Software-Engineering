import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { 
  getCartItems, 
  addToCart as addToCartAPI, 
  removeCartItem as removeCartItemAPI, 
  updateCartItem as updateCartItemAPI 
} from "../utilities/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    
    try {
      const items = await getCartItems();
      console.log("🔄 Fetching Cart Data:", items);
      setCartItems(items || []);
    } catch (error) {
      console.error("Lỗi tải giỏ hàng:", error);
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (variantId, quantity = 1) => {
    try {
      await addToCartAPI({ 
        variant_id: variantId, 
        quantity: quantity 
      });

      await fetchCart(); 
      
    } catch (error) {
      console.error("Add to cart failed:", error);
      throw error; 
    }
  };

  const removeFromCart = async (variantId) => {
    try {
      await removeCartItemAPI(variantId);
      setCartItems((prev) => prev.filter((item) => item.variant_id !== variantId));
      await fetchCart();
    } catch (error) {
      console.error("Remove cart failed:", error);
      await fetchCart();
    }
  };

  const updateQuantity = async (variantId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setCartItems((prev) =>
        prev.map((item) =>
          item.variant_id === variantId ? { ...item, quantity: newQuantity } : item
        )
      );

      await updateCartItemAPI(variantId, newQuantity);
      
      await fetchCart();
    } catch (error) {
      console.error("Update quantity failed:", error);
      await fetchCart(); 
    }
  };

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return total + price * qty;
    }, 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
      return cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        fetchCart, 
        totalPrice,
        totalItems,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);