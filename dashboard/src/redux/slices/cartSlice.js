import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // The cart items
  totalQuantity: 0, // Total quantity of items in the cart
  totalPrice: 0,
  totalIncludingShipping: 0, // Total price of items in the cart including shipping
  
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Adds an item to the cart
    addItemToCart: (state, action) => {
      const newItem = action.payload;
      // Look for an existing item in the cart by comparing IDs
      const existingItem = state.items.find(item => item._id === newItem._id);
    
      if (existingItem) {
        // If found, increase the quantity of the existing item based on payload
        existingItem.quantity += newItem.quantity; // Add the new quantity
      } else {
        // If not found, add the new item to the cart with its correct quantity
        state.items.push({
          ...newItem,
          quantity: newItem.quantity, // Set the correct quantity
        });
      }
      // Update totalQuantity and totalPrice
      state.totalQuantity += newItem.quantity; // Add the new quantity to total
      state.totalPrice += newItem.price * newItem.quantity; // Update total based on quantity
      state.totalIncludingShipping = state.totalPrice + (state.shippingPrice || 0);
    },
    

    // Removes an item from the cart
    removeItemFromCart: (state, action) => {
      const idToRemove = action.payload;
      const existingItemIndex = state.items.findIndex(item => item._id === idToRemove);

      if (existingItemIndex >= 0) {
        const existingItem = state.items[existingItemIndex];
        state.totalQuantity -= 1;
        state.totalPrice -= existingItem.price * existingItem.quantity;
        
        if (existingItem.quantity > 1) {
          state.items[existingItemIndex].quantity -= 1;
        } else {
          state.items.splice(existingItemIndex, 1);
        }
        // Update totalIncludingShipping by subtracting shipping price
        state.totalIncludingShipping = state.totalPrice + state.shippingPrice;
      }
    },
    // Loads the cart from local storage or another source
    loadCart: (state, action) => {
      const loadedCart = action.payload;
      state.items = loadedCart.items;
      state.totalQuantity = loadedCart.totalQuantity;
      state.totalPrice = loadedCart.totalPrice;
      // Ensure to load or reset the totalIncludingShipping if needed
      state.totalIncludingShipping = state.totalPrice + state.shippingPrice;
    },
    // Clears the cart
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      state.totalIncludingShipping = 0; 
    },
    setShipping: (state, action) => {
      state.shippingPrice = action.payload;
    },
    // Sets total price including shipping
    setTotalIncludingShipping: (state, action) => {
      state.totalIncludingShipping = action.payload;
    },
  },
});

// Export actions
export const { addItemToCart, removeItemFromCart, loadCart, clearCart, setTotalIncludingShipping } = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
