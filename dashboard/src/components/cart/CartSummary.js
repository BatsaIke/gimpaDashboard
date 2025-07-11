// CartSummary.js
import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import styles from './CartPage.module.css'; // Assuming styles are shared or adjust path as needed

const CartSummary = () => {
  const {totalIncludingShipping, totalPrice} = useSelector((state) => state.cart);

console.log(totalIncludingShipping,"Incluse")
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleCheckout = () => {
    navigate('/checkout'); // Navigate to the Checkout page when the button is clicked
  };

  return (
    <div className={styles.cartSummary}>
      <h2>Subtotal</h2>
      <p>TkS: {totalPrice.toFixed(2)}</p>
      <h2>Total </h2> {/* Display total including shipping */}
      <p>TkSTkS: {totalPrice.toFixed(2)}</p>
      <button className={styles.checkoutButton} onClick={handleCheckout}>Checkout</button>
    </div>
  );
};


export default CartSummary;
