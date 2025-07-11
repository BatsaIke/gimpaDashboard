import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../actions/productActions';

export const useProducts = (queryParams) => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);
  

  useEffect(() => {
    console.log("Fetching data directly from API");
    dispatch(fetchProducts(queryParams));
  }, [dispatch, JSON.stringify(queryParams)]); // Serialize queryParams to ensure stable dependency

  return { productsData: products, loading, error };
};
