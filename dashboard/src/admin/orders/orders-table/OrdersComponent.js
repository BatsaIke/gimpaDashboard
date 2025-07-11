import React, { useState, useEffect } from "react";
import styles from "./Component.module.css"; 
import { useSelector, useDispatch } from "react-redux";
import Spinner from "../../../UI/Spinner";
import OrdersTable from "./OrdersTable";
import { fetchOrders } from "../../../actions/orderActions";

function OrdersComponent() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(state => state.order);
  console.log(orders,"orders");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  if (loading) {
    return <Spinner />;
  }

  // Function to handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Logic to filter the displayed orders based on searchTerm
  // Added safety check for `order.name`
  const filteredOrders = searchTerm
    ? orders.filter(order =>
        order.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : orders;


  return (
    <div className={styles.ordersContainer}>
      <h2 className={styles.ordersHeader}>Orders</h2>
      <div className={styles.topBar}>
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>
      {filteredOrders.length > 0 ? (
        <OrdersTable orders={filteredOrders} />
      ) : (
        <p>No orders found!</p>
      )}
    </div>
  );
}

export default OrdersComponent;
