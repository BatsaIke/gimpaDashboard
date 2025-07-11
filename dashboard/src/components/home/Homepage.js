import React, { useState, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./Homepage.module.css";
import Spinner from "../../UI/Spinner";
import { useProducts } from "../hooks/useProducts";
import Modal from "../../UI/modal/Modal";

// Lazy load the HomeProducts component
const LazyHomeProducts = lazy(() => import("./HomeProducts"));
const LazyAddProductForm = lazy(() => import("../../admin/AddProduct/AddProducts"));

const Homepage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const category = searchParams.get("category") || "";
  const searchTerm = searchParams.get("search") || "";
  const [priceRange, setPriceRange] = useState("");
  const [sort, setSort] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const { productsData, loading, error } = useProducts({
    page,
    limit: 20,
    category,
    searchTerm,
    priceRange,
    sort,
  });

  const handleAddProductSuccess = () => {
    setIsAddProductOpen(false); // Close the modal on success
    // Optional: Trigger product refresh or toast notification
  };

  if (loading) return <Spinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.homepageContainer}>
      {/* Add Product Modal */}
      <Modal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        header="Add Product"
      >
        <Suspense fallback={<Spinner />}>
          <LazyAddProductForm onAddSuccess={handleAddProductSuccess} />
        </Suspense>
      </Modal>

      {/* Main content area */}
      <div className={styles.homeProducts}>
        <Suspense fallback={<Spinner />}>
          <LazyHomeProducts products={productsData?.products || []} />
        </Suspense>
      </div>
    </div>
  );
};

export default Homepage;
