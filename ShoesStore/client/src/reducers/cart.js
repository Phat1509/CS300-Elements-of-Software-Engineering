// reducers/cart.js
const initialState = { items: [] };

const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const item = action.payload || {};
            const exists = state.items.find((i) => i.id === item.id);
            const addQty = Number.isFinite(item.quantity) ? Math.max(0, item.quantity) : 1;
            if (exists) {
                return {
                    ...state,
                    items: state.items.map((i) =>
                        i.id === item.id ? { ...i, quantity: (i.quantity || 0) + addQty } : i
                    ),
                };
            }
            return {
                ...state,
                items: [...state.items, { ...item, quantity: addQty }],
            };
        }

        case 'UPDATE_QUANTITY': {
            const { id, quantity } = action.payload || {};
            if (!Number.isFinite(quantity)) return state;
            if (quantity <= 0) {
                return { ...state, items: state.items.filter((i) => i.id !== id) };
            }
            return { ...state, items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)) };
        }

        case 'REMOVE_ITEM': {
            const id = action.payload && action.payload.id;
            return { ...state, items: state.items.filter((i) => i.id !== id) };
        }

        case 'CLEAR_CART': {
            return { ...state, items: [] };
        }

        default:
            return state;
    }
};

export default cartReducer;
