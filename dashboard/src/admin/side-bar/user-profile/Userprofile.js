import React, { useState, useEffect } from 'react'; // Import useEffect for side-effects
import styles from './Userprofile.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../../../actions/authAction';
import { set_Alert } from '../../../actions/alertAction';

function UserProfile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);

  // Initialize formData state with empty values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
  });

  const [showUpdateComponents, setShowUpdateComponents] = useState(false);

  // Effect hook to update formData when user data is loaded
  useEffect(() => {
    if (user && user.data) {
      setFormData({
        name: user.data.name || '',
        email: user.data.email || '',
        avatar: user.data.avatar || '',
      });
    }
  }, [user]); // Depend on `user` to re-run this effect when `user` changes

  if (loading || !user || !user.data) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files.length) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prevFormData => ({ ...prevFormData, avatar: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { name, email, avatar } = formData;
    const userId = user.data._id;

    try {
      let response = await dispatch(updateUserProfile(userId, { name, email, avatar }));
      if (response && response.success) {
        dispatch(set_Alert("Profile updated successfully", "success"));
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  const handleToggleUpdateComponents = () => {
    setShowUpdateComponents(!showUpdateComponents);
  };

  return (
    <div className={styles.container}>
      <div className={styles.userProfile}>
        <img className={styles.avatar} src={formData.avatar || user.data.avatar} alt={user.data.name || 'User'} />
        <article className={styles.username}>{user.data.name}</article>
        <div className={styles.email}>{user.data.email}</div>
        
        {showUpdateComponents && (
          <form onSubmit={handleSubmit} className={styles.editForm}>
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            <input type="file" name="avatar" onChange={handleChange} accept="image/*" />
            <button type="submit">Update Profile</button>
          </form>
        )}
        <button onClick={handleToggleUpdateComponents} className={styles.update}>Update Profile</button>
      </div>
    </div>
  );
}

export default UserProfile;
