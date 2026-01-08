// client/src/context/WishlistContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { getWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist } from "../utilities/api";
const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();

  const [wishlistEntries, setWishlistEntries] = useState([]); // Array of product objects from API
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const userId = user ? (user.id || user.user_id || user.pid) : null;

  const refreshWishlist = async (uid = userId) => {
    if (!uid) {
      setWishlistEntries([]);
      return;
    }
    setWishlistLoading(true);
    try {
      const list = await getWishlist();
      setWishlistEntries(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("refreshWishlist error:", e);
      setWishlistEntries([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist(userId);
  }, [userId]);

  const isInWishlist = (productId) => {
    // API returns products directly, so check product.id
    return wishlistEntries.some((product) => {
      const pid = product.id || product.product_id;
      return String(pid) === String(productId);
    });
  };

  const getWishlistEntryId = (productId) => {
    const found = wishlistEntries.find((product) => {
      const pid = product.id || product.product_id;
      return String(pid) === String(productId);
    });
    return found ? (found.id || found.product_id) : null;
  };

  const addToWishlist = async (productId) => {
    if (!userId) throw new Error("NOT_LOGGED_IN");
    if (isInWishlist(productId)) return;

    await apiAddToWishlist(productId);
    await refreshWishlist(userId);
  };

  const removeFromWishlistByProductId = async (productId) => {
    if (!userId) throw new Error("NOT_LOGGED_IN");
    const entryId = getWishlistEntryId(productId);
    if (!entryId) return;

    await removeFromWishlist(productId);
    await refreshWishlist(userId);
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
    [wishlistEntries, wishlistLoading, userId]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => useContext(WishlistContext);