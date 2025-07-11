import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import alertSlice from './slices/alertSlice';
import cartSlice from './slices/cartSlice';
import orderSlice from './slices/orderSlice';
import productsSlice from './slices/productsSlice';
import reportSlice from './slices/reportSlice'
import departmentSlice from './slices/departmentSlice'
import employeesSlice from './slices/employeesSlice'
import kpiReducer from './slices/kpiSlice'
import kpiHeadersReducer from './slices/kpiHeaderSlice'; 
import discrepancyReducer from './slices/discrepancySlice';  
import rolesReducer from './slices/rolesSlice'


const rootReducer = combineReducers({
  auth: authReducer,
  alerts: alertSlice,
  cart: cartSlice,
  order: orderSlice,
  product: productsSlice,
  reports: reportSlice,
  departments: departmentSlice,
  employees: employeesSlice,
  kpis: kpiReducer,
  kpiHeaders: kpiHeadersReducer,
 discrepancies: discrepancyReducer ,
 roles: rolesReducer             
});


export default rootReducer;
