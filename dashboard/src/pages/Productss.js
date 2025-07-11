// src/Products.js
import React, { useState } from "react";
import styles from "./Products.module.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const productsData = [
  {
    id: 1,
    name: "Green vegetables",
    actualPrice: 250.0,
    discountPrice: 205.0,
    rating: 3,
    availability: "In Stock",
    image: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    name: "Lemon",
    actualPrice: 100.0,
    discountPrice: 90.0,
    rating: 1,
    availability: "Out of Stock",
    image: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    name: "Apple",
    actualPrice: 60.0,
    discountPrice: 45.0,
    rating: 4,
    availability: "In Stock",
    image: "https://via.placeholder.com/150",
  },
  {
    id: 4,
    name: "Chili",
    actualPrice: 16.51,
    discountPrice: 13.0,
    rating: 0,
    availability: "In Stock",
    image: "https://via.placeholder.com/150",
  },
  // Add more products here
];

const Products = () => {
  const [products, setProducts] = useState(productsData);

  const handleRatingClick = (productId, rating) => {
    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        return { ...product, rating };
      }
      return product;
    });
    setProducts(updatedProducts);
  };

  return (
    <div className={styles.productsContainer}>
      {products.map((product) => {
        const discountPercentage = Math.round(
          ((product.actualPrice - product.discountPrice) /
            product.actualPrice) *
            100
        );
        return (
          <div
            key={product.id}
            className={`${styles.productCard} ${
              product.availability === "Out of Stock"
                ? styles.outOfStockCard
                : ""
            }`}>
            {discountPercentage > 0 && (
              <div className={styles.discount}>-{discountPercentage}%</div>
            )}
            <img
              src={product.image}
              alt={product.name}
              className={styles.productImage}
            />
            <div className={styles.productInfo}>
              <h2 className={styles.productName}>{product.name}</h2>
              <div className={styles.priceContainer}>
                {product.discountPrice < product.actualPrice && (
                  <span className={styles.oldPrice}>
                    ${product.actualPrice.toFixed(2)}
                  </span>
                )}
                <span className={styles.productPrice}>
                  ${product.discountPrice.toFixed(2)}
                </span>
              </div>
              <p className={styles.productRating}>
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={index}
                    className={`fa fa-star${
                      index < product.rating ? " selected" : ""
                    }`}
                    onClick={() =>
                      handleRatingClick(product.id, index + 1)
                    }></span>
                ))}
              </p>
            </div>
            <button className={styles.addToCartButton}>
              <i className='fas fa-shopping-cart'></i> Add to Cart
            </button>
            {product.availability === "Out of Stock" && (
              <div className={styles.outOfStock}>Out of Stock</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Products;
