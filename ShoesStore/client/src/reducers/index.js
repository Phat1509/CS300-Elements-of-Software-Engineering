import { combineReducers } from "redux";
import cartReducer from "./cart.js";

const allReducers = combineReducers({
    cart: cartReducer,
});
export default allReducers;