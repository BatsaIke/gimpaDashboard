import { createSlice } from '@reduxjs/toolkit';

// Initial state for orders
const orderInitialState = {
  loading: false,
  error: null,
  orders: [], // Array to hold multiple orders
  currentOrder: null, // Object to hold details of the current order being processed or viewed
};

const orderSlice = createSlice({
  name: 'order',
  initialState: orderInitialState,
  reducers: {
    // Action to set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    // Action to set error message
    setError: (state, action) => {
      state.error = action.payload;
    },
    // Action to set the orders array (e.g., after fetching orders)
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    // Action to set the current order (e.g., after creating or fetching a single order)
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    // Action to add a new order to the orders array
    addOrder: (state, action) => {
      state.orders.push(action.payload);
    },
    // Action to update an order's status within the orders array
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const existingOrder = state.orders.find(order => order._id === orderId);
      if (existingOrder) {
        existingOrder.status = status;
      }
    },
    // Action to reset order state to initial state
    resetOrderState: () => orderInitialState,
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setOrders,
  setCurrentOrder,
  addOrder,
  updateOrderStatus,
  resetOrderState,
} = orderSlice.actions;

// Export reducer
export default orderSlice.reducer;
