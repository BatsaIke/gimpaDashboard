
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {

  FaUserEdit,
  FaSignOutAlt,
  FaBook,
  FaAccusoft,
  FaAddressBook,
} from "react-icons/fa";
import styles from "./Menulist.module.css";


import { useDispatch } from "react-redux";
import { logout } from "../../../../redux/slices/authSlice";

function MenuList() {
  // const [isContactsModalOpen, setIsContactsModalOpen] = useState(false); // State for Contacts Option modal

  const navigate = useNavigate();
  const dispatch = useDispatch(); 
 

  // Handler for navigating based on user selection

  // const handleContactsNavigation = (path) => {
  //   setIsContactsModalOpen(false); // Close the modal
  //   navigate(path); // Navigate to the selected path
  // };


  const handleLogout = () => {
    dispatch(logout()); 
    navigate('/');
  };

  return (
    <div className={styles.menuList}>
     
      

      <div className={styles.menuItem}>
        <NavLink to="/admin/orders" className={styles.menuLink}>
          <FaBook className={styles.menuIcon} />
          orders
        </NavLink>
      </div>
      <div className={styles.menuItem}>
        <NavLink to="/admin/products" className={styles.menuLink}>
          <FaAccusoft className={styles.menuIcon} />
          products
        </NavLink>
      </div>

      <div className={styles.menuItem}>
        <NavLink to="/admin/contacts" className={styles.menuLink}>
          <FaAddressBook className={styles.menuIcon} />
         contacts
        </NavLink>
      </div>

      
      <div className={styles.menuItem}>
        <NavLink to="/profile" className={styles.menuLink}>
          <FaUserEdit className={styles.menuIcon} />
          Edit Profile
        </NavLink>
      </div>
      <div className={styles.menuItem}>
        <div className={styles.menuLink} onClick={handleLogout}>
          <FaSignOutAlt className={styles.menuIcon} />
          Logout
        </div>
      </div>
    </div>
  );
}

export default MenuList;
