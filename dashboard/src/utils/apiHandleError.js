import { set_Alert } from "../actions/alertAction";

const apiErrorHandler = (dispatch, error) => {
  console.error('API Error:', error);

  const errorMessages = error.response?.data?.errors;
  const singleMessage = error.response?.data?.message;

  if (errorMessages && errorMessages.length) {
    errorMessages.forEach((err) => {
      const msg = err.msg || err.message || JSON.stringify(err);
      dispatch(set_Alert(msg, "danger"));
    });
  } else if (singleMessage) {
    dispatch(set_Alert(singleMessage, "danger"));
  } else {
    dispatch(set_Alert(error.message || "Unknown error occurred", "danger"));
  }
};

export default apiErrorHandler;
