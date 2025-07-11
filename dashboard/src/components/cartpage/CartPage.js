import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addItemToCart } from "../../redux/slices/cartSlice";

import styles from "./CartPage.module.css";
import { set_Alert } from "../../actions/alertAction";

const CartPage = ({ product, onClose }) => {
  // Ensure all sizes are included
  const sizes = ["small", "medium", "large"];
  const initialQuantities = sizes.reduce((acc, size) => {
    acc[size] = 0; // Initialize quantities to 0
    return acc;
  }, {});

  const [quantities, setQuantities] = useState(initialQuantities);

  const dispatch = useDispatch();

  // Increase or decrease
  const handleIncrease = (size) => {
    setQuantities((prev) => ({
      ...prev,
      [size]: prev[size] + 1,
    }));
  };

  const handleDecrease = (size) => {
    setQuantities((prev) => ({
      ...prev,
      [size]: Math.max(prev[size] - 1, 0), // Ensure it doesn't go below 0
    }));
  };

  // Filter valid variants (with a price)
  const validVariants = sizes.filter((size) => {
    const variant = product.variants.find((v) => v.size === size);
    return variant && variant.price !== undefined && variant.price !== null;
  });

  // Sum total based on price * quantity
  const total = validVariants.reduce((sum, size) => {
    const variant = product.variants.find((v) => v.size === size);
    return sum + (variant ? quantities[size] * variant.price : 0);
  }, 0);

  // Dispatch selected sizes
  const handleAddToCart = () => {
    let orderTotal = 0; // Initialize order total
  
    // Loop through valid sizes and dispatch only variants with quantities > 0
    validVariants.forEach((size) => {
      const variant = product.variants.find((v) => v.size === size);
      if (variant && quantities[size] > 0) {
        // Calculate the total price for each variant
        const variantTotal = quantities[size] * variant.price;
        orderTotal += variantTotal;
  
        // Dispatch the variant with its quantity
        dispatch(
          addItemToCart({
            _id: product._id + "-" + size,
            name: product.name + " - " + size,
            price: variant.price,
            image: product.image,
            quantity: quantities[size], // Correct quantity for the variant
          })
        );
      }
    });
  
    if (orderTotal > 0) {
      // Dispatch alert message if items are added to the cart
      dispatch(set_Alert(`${product.name} added to cart successfully!`, "success"));
    } else {
      // Dispatch alert message if no item is added
      dispatch(set_Alert("No items selected to add to cart.", "error"));
    }
  
  
    if (onClose) {
      onClose();
    }
  };
  

  return (
    <div className={styles.cartPage}>
      {/* Top row: image + product info */}
      <div className={styles.productRow}>
        <img
          src={product.image?.url}
          alt={product.name}
          className={styles.productImage}
        />
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name}</h3>
          <p className={styles.productPrice}>
            GHS {Math.min(...validVariants.map((size) => product.variants.find((v) => v.size === size)?.price || 0))} -{" "}
            {Math.max(...validVariants.map((size) => product.variants.find((v) => v.size === size)?.price || 0))}
          </p>
        </div>
      </div>

      <hr className={styles.divider} />

      <h4 className={styles.selectHeader}>Select</h4>

      <div className={styles.variantList}>
        {validVariants.map((size) => {
          const variant = product.variants.find((v) => v.size === size);
          return (
            <div className={styles.variantRow} key={size}>
              <div className={styles.variantName}>{size}</div>
              <div className={styles.variantPrice}>
                GHS {variant ? variant.price : "-"}
              </div>
              <div className={styles.quantityControls}>
                <button onClick={() => handleDecrease(size)}>-</button>
                <span>{quantities[size]}</span>
                <button onClick={() => handleIncrease(size)}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <span className={styles.footerLabel}>Total</span>
          <span className={styles.footerValue}>{total.toFixed(2)}</span>
        </div>
        <button className={styles.addToCartButton} onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default CartPage;
