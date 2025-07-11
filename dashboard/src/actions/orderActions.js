import api from "../api";
import { addOrder, setCurrentOrder,updateOrderStatus as updateOrderStatusReducer, setError, setLoading, setOrders } from "../redux/slices/orderSlice";
import apiErrorHandler from "../utils/apiHandleError";



// Create an order
export const createOrder = (orderData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.post("/orders", orderData);
    console.log(orderData,"ORder data"); 
    
    if (response.status === 201) {
      dispatch(addOrder(response.data));
      return { success: true, order: response.data };
    } else {
      dispatch(setError("Failed to create order."));
      return { success: false, message: "Failed to create order." }; 
    }
  } catch (error) {
    apiErrorHandler(error, dispatch);
    return { success: false, message: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};


export const updateOrderStatus = (orderId, newStatus) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
    if (response.status === 200) {
      dispatch(updateOrderStatusReducer({ orderId, status: newStatus }));
      return { success: true };
    } else {
      dispatch(setError("Failed to update order status."));
      return { success: false, message: "Failed to update order status." };
    }
  } catch (error) {
    apiErrorHandler(error, dispatch);
    return { success: false, message: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};


// Fetch all orders
export const fetchOrders = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.get("/orders");
    if (response.status === 200) {
      dispatch(setOrders(response.data));
      return { success: true };
    } else {
      dispatch(setError("Failed to fetch orders."));
      return { success: false, message: "Failed to fetch orders." };
    }
  } catch (error) {
    apiErrorHandler(error, dispatch);
    return { success: false, message: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};

// Fetch a single order by ID
export const fetchOrderById = (id) => async (dispatch) => {
  console.log("feth order")

    dispatch(setLoading(true));
    
    try {
      const response = await api.get(`orders/${id}`);
      if (response.status === 200) {
        dispatch(setCurrentOrder(response.data));
        return { success: true, order: response.data };
      } else {
        dispatch(setError("Failed to fetch order."));
        return { success: false, message: "Failed to fetch order." };
      }
    } catch (error) {
      apiErrorHandler(error, dispatch);
      return { success: false, message: error.message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Delete an order
export const deleteOrder = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await api.delete(`/orders/${id}`);
      if (response.status === 200) {
        dispatch(fetchOrders()); // Refresh the orders list after deletion
        return { success: true };
      } else {
        dispatch(setError("Failed to delete order."));
        return { success: false, message: "Failed to delete order." };
      }
    } catch (error) {
      apiErrorHandler(error, dispatch);
      return { success: false, message: error.message };
    } finally {
      dispatch(setLoading(false));
    }
  };