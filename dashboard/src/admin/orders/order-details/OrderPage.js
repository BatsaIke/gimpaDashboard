import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./OrdersPage.module.css";
import { fetchOrders, updateOrderStatus } from "../../../actions/orderActions";
import Spinner from "../../../UI/Spinner";
import Pagination from "../../../components/pagination/Pagination";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatus(orderId, newStatus));
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((order) => order.status === filter);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const displayedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className={styles.ordersContainer}>
      <div className={styles.ordersHeader}>
        <h2 className={styles.header}>Orders</h2>

        <div className={styles.filterContainer}>
          <label htmlFor="statusFilter" className={styles.filterLabel}>
            Filter:
          </label>
          <select
            id="statusFilter"
            value={filter}
            onChange={handleFilterChange}
            className={styles.filterSelect}
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Products</th>
              <th>Price</th>
              <th>Delivery</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {displayedOrders.map((order) => (
              <tr key={order._id}>
                <td>{order.items?.[0]?.product?.name || "No Customer Data"}</td>
                <td>
                  {order.items && order.items.length > 0
                    ? order.items
                        .map((item) => {
                          const variantName = item.product?.variants?.find(
                            (variant) =>
                              item.product.variants.indexOf(variant) ===
                              order.items.indexOf(item)
                          )?.name;
                          return variantName || "Variant Missing";
                        })
                        .join(", ")
                    : "No Products"}
                </td>
                <td>{order.totalAmount || "N/A"}</td>
                <td>
                  {order.deliveryLocation
                    ? "Delivery"
                    : order.deliveryOption || "Pick up"}
                </td>
                <td>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "Unknown Date"}
                </td>
                <td>
                  <select
                    value={order.status || "Pending"}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    className={`${styles.statusSelect} ${
                      styles[order.status?.toLowerCase() || "pending"]
                    }`}
                  >
                    
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default OrdersPage;
