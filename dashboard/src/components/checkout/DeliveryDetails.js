import React, { useState } from "react";
import styles from "./DeliveryDetails.module.css";

const DeliveryDetails = ({
  deliveryOption,
  setDeliveryOption,
  deliveryLocation,
  setDeliveryLocation,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const cities = [
    "Accra",
    "Kumasi",
    "Takoradi",
    "Tamale",
    "Cape Coast",
    "Ho",
    "Sunyani",
    "Bolgatanga",
    "Koforidua",
    "Wa",
  ];

  const handleLocationChange = (event) => {
    setDeliveryLocation(event.target.value);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionHeading}>Delivery Details</h3>
      <label className={styles.label}>Select delivery option</label>
      <div className={styles.deliveryButtons}>
        <button
          className={`${styles.deliveryBtn} ${
            deliveryOption === "Delivery" ? styles.active : ""
          }`}
          onClick={() => setDeliveryOption("Delivery")}
        >
          Delivery
        </button>
        <button
          className={`${styles.deliveryBtn} ${
            deliveryOption === "Pick up" ? styles.active : ""
          }`}
          onClick={() => setDeliveryOption("Pick up")}
        >
          Pick up
        </button>
      </div>

      <div className={styles.locationCard}>
        <div className={styles.locationHeader}>Delivery location</div>
        <div className={styles.locationRow}>
          <span className={styles.locationName}>{deliveryLocation}</span>
          <button
            className={styles.changeBtn}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Change
          </button>
        </div>
        {isDropdownOpen && (
          <select
            className={styles.cityDropdown}
            value={deliveryLocation}
            onChange={handleLocationChange}
          >
            <option value="" disabled>
              Select a city
            </option>
            {cities.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default DeliveryDetails;
