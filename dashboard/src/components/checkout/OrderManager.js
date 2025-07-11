// OrderManager.js
import { useDispatch } from 'react-redux';
import {  verifyPayment } from "../../actions/paymentActions";
import { createOrder } from "../../actions/orderActions"

const useOrderManager = () => {
    const dispatch = useDispatch();

    const verifyAndCreateOrder = async (callbackReference, storedReference, storedOrderData) => {
        let referenceUsed = false;

        // Check with the callback reference first
        if (storedReference) {
            const verifyResult = await dispatch(verifyPayment(callbackReference));
            if (verifyResult.success && storedOrderData) {
                const orderResult = await dispatch(createOrder(storedOrderData));
                if (orderResult.success) {
                    localStorage.removeItem('orderData');
                    localStorage.removeItem('reference');
                    return true;
                }
            }
            referenceUsed = callbackReference;
        }

        // Fallback to the stored reference if callback verification failed or didn't exist
        if (!referenceUsed && storedReference && storedOrderData) {
            const verifyResult = await dispatch(verifyPayment(storedReference));
            if (verifyResult.success) {
                const orderResult = await dispatch(createOrder(storedOrderData));
                if (orderResult.success) {
                    localStorage.removeItem('orderData');
                    localStorage.removeItem('reference');
                    return true;
                }
            }
        }

        return false;
    };

    return { verifyAndCreateOrder };
};

export default useOrderManager;
