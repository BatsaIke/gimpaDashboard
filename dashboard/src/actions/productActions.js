// productActions.js

import api from "../api";
import {
  addProduct,
  deleteProduct,
  setCurrentProduct,
  setError,
  setLoading,
  setProducts,
  updateProduct,
} from "../redux/slices/productsSlice";
import apiErrorHandler from "../utils/apiHandleError";

// Create a product
export const createProduct = (productData) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      // Since we're sending JSON data including a Base64 encoded image, set the Content-Type to application/json
      const response = await api.post("/products", productData);
      if (response.status === 201) {
        dispatch(addProduct(response.data));
        return { success: true, product: response.data };
      } else {
        dispatch(setError("Failed to create product."));
        return { success: false, message: "Failed to create product." };
      }
    } catch (error) {
      apiErrorHandler(error, dispatch);
      return { success: false, message: error.message };
    } finally {
      dispatch(setLoading(false));
    }
};



// Fetch all products
// productActions.js

// Fetch all products with optional filtering, pagination, and sorting
export const fetchProducts = ({ page = 1, limit = 20, name = '', category = '', sortBy = 'createdAt', sortOrder = 'desc' } = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.get(`/products`, {
      params: { page, limit, name, category, sortBy, sortOrder }
    });
    if (response.status === 200) {
      dispatch(setProducts({ products: response.data })); // Wrap the fetched products in an object
      return { success: true };
    } else {
      dispatch(setError("Failed to fetch products."));
      return { success: false, message: "Failed to fetch products." };
    }
  } catch (error) {
    apiErrorHandler(error, dispatch);
    return { success: false, message: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};


// Fetch a single product by ID
export const fetchProductById = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.get(`/products/${id}`);
    if (response.status === 200) {
      dispatch(setCurrentProduct(response.data));
      return { success: true, product: response.data };
    } else {
      dispatch(setError("Failed to fetch product."));
      return { success: false, message: "Failed to fetch product." };
    }
  } catch (error) {
    apiErrorHandler(error, dispatch);
    return { success: false, message: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};

// Update a product
export const updateAProduct = (id, productData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const formData = new FormData();
    for (const key in productData) {
      formData.append(key, productData[key]);
    }
    const response = await api.put(`/products/${id}`, formData);
    if (response.status === 200) {
      dispatch(updateProduct(response.data));
      return { success: true, product: response.data };
    } else {
      dispatch(setError("Failed to update product."));
      return { success: false, message: "Failed to update product." };
    }
  } catch (error) {
    apiErrorHandler(error, dispatch);
    return { success: false, message: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};

// Delete a product
export const deleteAProduct = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.delete(`/products/${id}`);
    if (response.status === 200) {
      dispatch(deleteProduct(id)); // Refresh the product list after deletion
      return { success: true };
    } else {
      dispatch(setError("Failed to delete product."));
      return { success: false, message: "Failed to delete product." };
    }
  } catch (error) {
    apiErrorHandler(error, dispatch);
    return { success: false, message: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};
