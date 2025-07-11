// PaymentDetails.jsx
import React from "react";
import styles from "./PaymentDetails.module.css";

const PaymentDetails = ({
  name,
  setName,
  phoneCountryCode,
  setPhoneCountryCode,
  phoneNumber,
  setPhoneNumber,
  paymentMethod,
  setPaymentMethod,
  momoSameAsPhone,
  setMomoSameAsPhone,
  momoPhoneNumber,
  setMomoPhoneNumber,
}) => {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionHeading}>Payment Details</h3>

      {/* Name */}
      <label className={styles.label}>Name*</label>
      <input
        type="text"
        className={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Phone */}
      <label className={styles.label}>Phone number*</label>
      <div className={styles.phoneGroup}>
        <select
          className={styles.countryCode}
          value={phoneCountryCode}
          onChange={(e) => setPhoneCountryCode(e.target.value)}
        >
          <option value="+233">+233</option>
        </select>
        <input
          type="text"
          className={styles.phoneInput}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>

      {/* Payment Method */}
      <h4 className={styles.paymentMethodTitle}>Select Payment method</h4>
      <div className={styles.radioGroup}>
        <label className={styles.radioLabel}>
          <input
            type="radio"
            name="payment"
            value="Momo"
            checked={paymentMethod === "Momo"}
            onChange={() => setPaymentMethod("Momo")}
          />
          Momo
        </label>
        <label className={styles.radioLabel}>
          <input
            type="radio"
            name="payment"
            value="Card"
            checked={paymentMethod === "Card"}
            onChange={() => setPaymentMethod("Card")}
          />
          Card
        </label>
        <label className={styles.radioLabel}>
          <input
            type="radio"
            name="payment"
            value="Cash"
            checked={paymentMethod === "Cash"}
            onChange={() => setPaymentMethod("Cash")}
          />
          Cash on delivery
        </label>
      </div>

      {/* Momo same as phone */}
      <div className={styles.checkboxGroup}>
        <label>
          <input
            type="checkbox"
            checked={momoSameAsPhone}
            onChange={(e) => setMomoSameAsPhone(e.target.checked)}
          />
          <span>Is your Momo number the same as your phone number?</span>
        </label>
      </div>

      {/* Momo phone number */}
      <label className={styles.label}>Phone number*</label>
      <div className={styles.phoneGroup}>
        <select className={styles.countryCode} disabled={momoSameAsPhone}>
          <option value="+233">+233</option>
        </select>
        <input
          type="text"
          className={styles.phoneInput}
          value={momoPhoneNumber}
          onChange={(e) => setMomoPhoneNumber(e.target.value)}
          disabled={momoSameAsPhone}
        />
      </div>
    </div>
  );
};

export default PaymentDetails;
