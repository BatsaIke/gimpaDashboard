import React, { useState } from "react";
import styles from "./Homepage.module.css";
import ProductCard from "../products card/ProductsCard";

// Imports the standard Modal component
import Modal from "../../UI/modal/Modal";
// Imports the AddProductForm (the one that dispatches createProduct/updateAProduct)
import AddProductForm from "../../admin/AddProduct/AddProducts";

const HomeProducts = ({ products = [] }) => {
  // Modal open/close state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Open the "Add Product" modal
  const handleOpenAddProduct = () => {
    setIsAddProductOpen(true);
  };

  // Close the modal
  const handleCloseAddProduct = () => {
    setIsAddProductOpen(false);
  };

  // After a product is successfully added, close modal & optionally refresh
  const handleAddSuccess = () => {
    setIsAddProductOpen(false);
    // e.g., re-fetch products or show a success toast
  };

  // If no products, show a quick message
  if (!products || products.length === 0) {
    return <div>No products found</div>;
  }

  return (
    <div>
      {/* Top: Title + Buttons */}
      <div className={styles.topHeader}>
        <h2 className={styles.pageTitle}>Products</h2>
        <div className={styles.buttonContainer}>
          {/* Clicking "Add Product" opens the modal */}
          <button className={styles.addProductBtn} onClick={handleOpenAddProduct}>
            Add Product
          </button>
          <button className={styles.addToCartBtn}>Add to Cart</button>
        </div>
      </div>

      {/* Three-column product grid */}
      <div className={styles.productsGrid}>
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Modal containing the AddProductForm */}
      <Modal
        isOpen={isAddProductOpen}
        onClose={handleCloseAddProduct}
        header="Add Product"
      >
        <AddProductForm onAddSuccess={handleAddSuccess} />
      </Modal>
    </div>
  );
};

export default HomeProducts;
