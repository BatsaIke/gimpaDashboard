import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import PaymentDetails from "./PaymentDetails";
import DeliveryDetails from "./DeliveryDetails";
import styles from "./CheckoutPage.module.css";
import { createOrder } from "../../actions/orderActions";
import { clearCart } from "../../redux/slices/cartSlice";
import { useNavigate } from "react-router-dom";

const CheckoutPage = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const totalPrice = useSelector((state) => state.cart.totalPrice);

  // Form states
  const [name, setName] = useState("Kwame Dartey");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+233");
  const [phoneNumber, setPhoneNumber] = useState("278 811 107");
  const [paymentMethod, setPaymentMethod] = useState("Momo");
  const [momoSameAsPhone, setMomoSameAsPhone] = useState(false);
  const [momoPhoneNumber, setMomoPhoneNumber] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("Delivery");
  const [deliveryLocation, setDeliveryLocation] = useState("Circle");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);

  const validate = () => {
    if (!name.trim() || !phoneNumber.trim()) {
      setError("Name and phone number are required.");
      return false;
    }
    if (paymentMethod === "Momo" && !momoSameAsPhone && !momoPhoneNumber.trim()) {
      setError("Please provide a valid Momo number.");
      return false;
    }
    if (deliveryOption === "Delivery" && !deliveryLocation.trim()) {
      setError("Delivery location is required for delivery.");
      return false;
    }
    return true;
  };

  const handleContinueToPay = async () => {
    setError("");
    if (!validate()) return;

    const orderData = {
      customerName: name,
      phone: phoneCountryCode + " " + phoneNumber,
      paymentMethod,
      momoNumber: momoSameAsPhone
        ? phoneCountryCode + " " + phoneNumber
        : phoneCountryCode + " " + momoPhoneNumber,
      deliveryOption,
      deliveryLocation,
      totalAmount: totalPrice,
      items: cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      })),
    };

    const result = await dispatch(createOrder(orderData));

    if (result.success) {
      console.log("Order created successfully: ", result.order);

      // Clear the cart on successful order creation
      dispatch(clearCart());
      setSuccessMessage(true); // Show success message
    } else {
      setError(result.message || "Could not create order.");
    }
  };

  if (successMessage) {
    return (
      <div className={styles.successMessage}>
        <h3>Order placed successfully!</h3>
        <p>Your order has been placed. You can continue shopping or visit your orders page.</p>
        <button
  className={styles.continueButton}
  onClick={() => {
    navigate("/"); // Navigate to the homepage
    onClose(); // Close the modal
  }}
>
  Continue to Homepage
</button>

      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <PaymentDetails
        name={name}
        setName={setName}
        phoneCountryCode={phoneCountryCode}
        setPhoneCountryCode={setPhoneCountryCode}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        momoSameAsPhone={momoSameAsPhone}
        setMomoSameAsPhone={setMomoSameAsPhone}
        momoPhoneNumber={momoPhoneNumber}
        setMomoPhoneNumber={setMomoPhoneNumber}
      />

      <DeliveryDetails
        deliveryOption={deliveryOption}
        setDeliveryOption={setDeliveryOption}
        deliveryLocation={deliveryLocation}
        setDeliveryLocation={setDeliveryLocation}
      />

      {error && <p className={styles.errorMessage}>{error}</p>}

      <div className={styles.bottomBar}>
        <button className={styles.payButton} onClick={handleContinueToPay}>
          Continue to Pay
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
