import { setAlert, removeAlert } from "../redux/slices/alertSlice"; 
import { v4 as uuidv4 } from "uuid";

export const set_Alert =
  (msg, alertType, timeout = 3000) =>
  (dispatch) => {
    const id = uuidv4();
    dispatch(setAlert({ msg, alertType, id }));

    setTimeout(() => dispatch(removeAlert(id)), timeout);
  };
 