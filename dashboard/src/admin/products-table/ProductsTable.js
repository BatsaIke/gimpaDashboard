import React from "react";
import styles from "./ProductsTable.module.css";

function ProductsTable({ products, onDelete }) {
  return (
    <table className={styles.productsTable}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Variants</th>
          <th>Qty.</th>
          <th>Min. Price</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => {
          const totalQty = product.variants.reduce(
            (sum, variant) => sum + (variant.quantity || 0),
            0
          );
          const minPrice = Math.min(
            ...product.variants.map((variant) => variant.price || 0)
          );

          return (
            <tr key={product._id}>
              <td data-label="Name">{product.name}</td>
              <td data-label="Variants">
                {product.variants
                  .map((variant) => variant.name)
                  .join(", ")}
              </td>
              <td data-label="Qty.">{totalQty}</td>
              <td data-label="Min. Price">₵ {minPrice}</td>
              <td data-label="Action" className={styles.actionCell}>
                <button
                  className={styles.deleteBtn}
                  onClick={() => onDelete(product._id)}
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default ProductsTable;
