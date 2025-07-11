// OrdersTable.js
import React from "react";
import styles from "./OrdersTable.module.css"; 
import { useNavigate } from "react-router-dom";


function OrdersTable({ orders }) {
    const navigate = useNavigate();

    const viewOrderDetails = (orderId) => {
        // Navigate to the order details page with the order ID
        navigate(`/admin/orderdetails/${orderId}`);
      };
  return (
    <table className={styles.ordersTable}>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Total Amount</th>
          <th>Status</th>
          <th>Order Date</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order._id}>
            <td>{order._id}</td>
            <td>{order.customerName}</td> {/* Assuming you have customer name */}
            <td>₵{order.totalAmount.toFixed(2)}</td>
            <td>{order.status}</td>
            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
            <td>
            <button
                onClick={() => viewOrderDetails(order._id)}
                className={styles.detailsButton}
              >
                View Details
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default OrdersTable;
