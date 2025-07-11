// Make sure to import the CartItems and CartSummary components at the top
import React from 'react';
import { useSelector } from 'react-redux';
import styles from './CartPage.module.css'; // CSS module for styling
import CartItems from './CartItems'; // Adjust the import path as necessary
import CartSummary from './CartSummary'; // Adjust the import path as necessary

const CartPage = () => {
  const cartItems = useSelector((state) => state.cart.items); 
  // const subtotal = useSelector((state) => state.cart.totalPrice); 

  return (
    <div className={styles.container}>
      <h1 className={styles.cartHeading}>Cart</h1>
      {cartItems.length === 0 ? (
        <div className={styles.emptyCartMessage}>
          No products in the cart.
        </div>
      ) : (
        // Removed the redundant cartContainer div
        <div className={styles.cartContainer}>
          <CartItems />
          <CartSummary />
        </div>
      )}
    </div>
  );
};

export default CartPage;
