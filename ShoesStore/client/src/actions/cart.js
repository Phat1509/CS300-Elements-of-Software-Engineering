// actions/cart.js
export const addToCart = (id, info) => {
    return {
        type: "ADD_TO_CART",
        id: id,
        info: info,
    };
}
export const updateQuantity = (id, quantity = 1) => {
    return {
        type: "UPDATE_QUANTITY",
        id: id,
        info: info,
        quantity: quantity
    };
}