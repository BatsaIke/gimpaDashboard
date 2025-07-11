
import React, {  useEffect } from "react";


import { useParams } from "react-router-dom";
import { fetchOrderById,updateOrderStatus  } from "../../../actions/orderActions";
import {useDispatch, useSelector} from'react-redux' 
import OrdersPage from "./OrderPage";

const OrderDetailsComponent = () => {
  
  return (
    <OrdersPage/>
  );
};

export default OrderDetailsComponent;