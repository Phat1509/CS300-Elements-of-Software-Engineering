// client/src/context/WishlistContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { getWishlist, addWishlist, removeWishlist } from "../utilities/api";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();

  const [wishlistEntries, setWishlistEntries] = useState([]); // [{id, user_id, product_id}]
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const userId = user ? (user.id || user.user_id) : null;

  const refreshWishlist = async (uid = userId) => {
    if (!uid) {
      setWishlistEntries([]);
      return;
    }
    setWishlistLoading(true);
    try {
      const list = await getWishlist(uid);
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
    return wishlistEntries.some((w) => String(w.product_id) === String(productId));
  };

  const getWishlistEntryId = (productId) => {
    const found = wishlistEntries.find((w) => String(w.product_id) === String(productId));
    return found ? found.id : null;
  };

  const addToWishlist = async (productId) => {
    if (!userId) throw new Error("NOT_LOGGED_IN");
    if (isInWishlist(productId)) return;

    await addWishlist({
      user_id: userId,
      product_id: Number(productId),
    });

    await refreshWishlist(userId);
  };

  const removeFromWishlistByProductId = async (productId) => {
    if (!userId) throw new Error("NOT_LOGGED_IN");
    const entryId = getWishlistEntryId(productId);
    if (!entryId) return;

    await removeWishlist(entryId);
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
    [wishlistEntries, wishlistLoading]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => useContext(WishlistContext);