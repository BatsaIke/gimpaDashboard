import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./Products.module.css";
import { fetchProducts, deleteAProduct } from "../../actions/productActions";
import ProductsTable from "./ProductsTable";
import Spinner from "../../UI/Spinner";
import Pagination from "../../components/pagination/Pagination";

function Products() {
  const dispatch = useDispatch();
  const { products: nestedProducts, loading } = useSelector(
    (state) => state.product
  );
  const products = nestedProducts.products || [];

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Load all products on mount
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleDelete = async (productId) => {
    await dispatch(deleteAProduct(productId));
    // optionally re-fetch or remove from local state
    dispatch(fetchProducts());
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calculate paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className={styles.productsContainer}>
      {/* Page Header */}
      <h2 className={styles.pageTitle}>Product History</h2>

      {/* Products Table */}
      {currentProducts.length > 0 ? (
        <ProductsTable products={currentProducts} onDelete={handleDelete} />
      ) : (
        <p className={styles.noProducts}>No products yet!</p>
      )}

      {/* Pagination */}
      {products.length > itemsPerPage && (
        <Pagination
          totalPages={Math.ceil(products.length / itemsPerPage)}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default Products;
