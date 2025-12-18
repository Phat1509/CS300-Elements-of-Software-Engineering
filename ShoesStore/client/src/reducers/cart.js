// reducers/cart.js
const cartReducer = (state = { items: [] }, action) => {
     const newState = { ...state };
    switch (action.type) {
        case 'ADD_PRODUCT':
            return [
                ...state,
                {
                    id: action.id,
                    info: action.info,
                    quantity: action.quantity
                }
            ];
        case 'UPDATE_QUANTITY':
            const updatedItem = newState.find(item => item.id === action.id);
            if (updatedItem) {
                updatedItem.quantity ++;
                return [...newState];
            } 
        
        default:
            return state;   
        
    }
}
