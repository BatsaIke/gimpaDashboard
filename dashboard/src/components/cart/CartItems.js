import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './CartPage.module.css'; // Assuming styles are shared or adjust path as needed
import { addItemToCart, removeItemFromCart } from '../../redux/slices/cartSlice';

const CartItems = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  console.log(cartItems,"cartitems")

  const handleAddItem = (item) => {
    dispatch(addItemToCart(item));
  };

  const handleRemoveItem = (id) => {
    dispatch(removeItemFromCart(id));
  };

  return (
    <div className={styles.cartItems}>
      <h2>Product</h2>
      {cartItems.map((item) => (
        <div key={item._id} className={styles.cartItem}>
          <img src={item.image?.url} alt={item.name} className={styles.itemImage} />
          <span>{item.name}</span>
          <div className={styles.quantityControls}>
            <button onClick={() => handleRemoveItem(item._id)}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => handleAddItem(item)}>+</button>
          </div>
          <span className={styles.total}>{`Tks ${(item.price * item.quantity).toFixed(2)}`}</span>
        </div>
      ))}
    </div>
  );
};

export default CartItems;
