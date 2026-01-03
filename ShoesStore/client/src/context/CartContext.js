// client/src/context/CartContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import api, { getCartItems } from "../ultilities/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [total, setTotal] = useState(0);

  // Khi User thay đổi -> Load lại giỏ hàng của User đó
  useEffect(() => {
    if (user) {
      fetchCart(user.user_id);
    } else {
      setCartItems([]); // Logout thì xóa giỏ hàng trên UI
      setTotal(0);
    }
  }, [user]);

  const fetchCart = async (userId) => {
    try {
      // Tìm cart cũ hoặc tạo mới
      const cartRes = await api.get(`/cart?user_id=${userId}`);
      let currentCartId;

      if (cartRes.data.length === 0) {
        const newCart = await api.post("/cart", { user_id: userId, created_at: new Date() });
        currentCartId = newCart.data.cart_id;
      } else {
        currentCartId = cartRes.data[0].cart_id;
      }
      setCartId(currentCartId);

      // Load items chi tiết
      const items = await getCartItems(currentCartId);
      setCartItems(items);
      
      // Tính tổng tiền
      const sum = items.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
      setTotal(sum);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const addToCart = async (variantId, quantity) => {
    if (!user) {
      alert("Please login to add to cart");
      return;
    }
    try {
      const existingItem = cartItems.find(item => item.variant_id === variantId);
      if (existingItem) {
        await api.patch(`/cart_item/${existingItem.id}`, { quantity: existingItem.quantity + quantity });
      } else {
        await api.post("/cart_item", { cart_id: cartId, variant_id: variantId, quantity });
      }
      await fetchCart(user.user_id); // Refresh lại UI ngay lập tức
      alert("Added to cart!");
    } catch (error) {
      console.error("Add failed:", error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/cart_item/${itemId}`);
      fetchCart(user.user_id);
    } catch (error) {
      console.error("Remove failed", error);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, total, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);