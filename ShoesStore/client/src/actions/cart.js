// actions/cart.js
export const addToCart = (item) => {
    return {
        type: "ADD_TO_CART",
        payload: item,
    };
};

export const updateQuantity = (id, quantity) => {
    return {
        type: "UPDATE_QUANTITY",
        payload: { id, quantity },
    };
};

export const removeItem = (id) => ({ type: 'REMOVE_ITEM', payload: { id } });

export const clearCart = () => ({ type: 'CLEAR_CART' });