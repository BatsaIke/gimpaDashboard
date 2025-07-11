import { createSlice } from '@reduxjs/toolkit';

// Initial state for products
const productInitialState = {
  loading: false,
  error: null,
  products: [], 
  currentProduct: null, 
  searchTerm: '', 

};

const productSlice = createSlice({
  name: 'product',
  initialState: productInitialState,
  reducers: {
    // Action to set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    // Action to set error message
    setError: (state, action) => {
      state.error = action.payload;
    },
    // Action to set the products array (e.g., after fetching products from the database)
    setProducts: (state, action) => {
      state.products = action.payload.products; 
    },
    // Action to set the current product (e.g., after creating, fetching, or selecting a single product)
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    // Action to add a new product to the products array (e.g., after creating a new product)
    addProduct: (state, action) => {
      state.products.push(action.payload);
    },
    // Action to update a product in the products array (optional, could be used for updating product details)
    updateProduct: (state, action) => {
      const index = state.products.findIndex(product => product.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    // Action to delete a product from the products array (optional, could be used for removing a product)
    deleteProduct: (state, action) => {
      state.products = state.products.filter(product => product.id !== action.payload);
    },
    // Action to reset product state to initial state
    resetProductState: () => productInitialState,
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setProducts,
  setCurrentProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  resetProductState,
  setSearchTerm,
  
} = productSlice.actions;

// Export reducer
export default productSlice.reducer;
