// client/src/context/WishlistContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { getWishlist, addWishlist, removeWishlist } from "../utilities/api";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();

  const [wishlistEntries, setWishlistEntries] = useState([]); // [{id, user_id, product_id}]
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const userId = user ? (user.id || user.user_id || user.pid) : null;

  const refreshWishlist = async () => {
    if (!userId) {
      setWishlistEntries([]);
      return;
    }
    setWishlistLoading(true);
    try {
      const list = await getWishlist();
      // API returns array of products, convert to wishlist entries
      const entries = Array.isArray(list) ? list.map(product => ({
        id: product.id,
        product_id: product.id,
        user_id: userId
      })) : [];
      setWishlistEntries(entries);
    } catch (e) {
      console.error("refreshWishlist error:", e);
      setWishlistEntries([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [userId]);

  const isInWishlist = (productId) => {
    return wishlistEntries.some((w) => String(w.product_id) === String(productId));
  };

  const getWishlistEntryId = (productId) => {
    const found = wishlistEntries.find((w) => String(w.product_id) === String(productId));
    return found ? found.id : null;
  };

  const addToWishlist = async (productId) => {
    if (!userId) throw new Error("NOT_LOGGED_IN");
    if (isInWishlist(productId)) return;

    await addWishlist(productId);
    await refreshWishlist();
  };

  const removeFromWishlistByProductId = async (productId) => {
    if (!userId) throw new Error("NOT_LOGGED_IN");
    if (!isInWishlist(productId)) return;

    await removeWishlist(productId);
    await refreshWishlist();
  };

  const toggleWishlist = async (productId) => {
    if (!userId) throw new Error("NOT_LOGGED_IN");

    if (isInWishlist(productId)) {
      await removeFromWishlistByProductId(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const value = useMemo(
    () => ({
      wishlistEntries,
      wishlistLoading,
      refreshWishlist,
      isInWishlist,
      toggleWishlist,
      addToWishlist,
      removeFromWishlistByProductId,
    }),
    [wishlistEntries, wishlistLoading]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => useContext(WishlistContext);