import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faPhone, 
  faPaperPlane, 
  faUser, 
  faMessage,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        <div className={styles.contactContent}>
          <div className={styles.contactInfoGlass}>
            <h1 className={styles.sectionTitle}>Get in Touch</h1>
            <p className={styles.sectionSubtitle}>We'd love to hear from you. Choose the most convenient way to contact us.</p>
            
            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <div className={styles.contactDetails}>
                <h3>Email Us</h3>
                <p>batsa2010isaac@gmail.com</p>
              </div>
            </div>
            
            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <FontAwesomeIcon icon={faPhone} />
              </div>
              <div className={styles.contactDetails}>
                <h3>Call Us</h3>
                <p>+233 543 869 957</p>
              </div>
            </div>
            
            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <FontAwesomeIcon icon={faWhatsapp} />
              </div>
              <div className={styles.contactDetails}>
                <h3>WhatsApp</h3>
                <p>+233 543 869 957</p>
              </div>
            </div>

            <div className={styles.socialLinks}>
              <a href="mailto:batsa2010isaac@gmail.com" className={styles.socialLink}>
                <FontAwesomeIcon icon={faEnvelope} />
              </a>
              <a href="tel:+233543869957" className={styles.socialLink}>
                <FontAwesomeIcon icon={faPhone} />
              </a>
              <a href="https://wa.me/233543869957" className={styles.socialLink}>
                <FontAwesomeIcon icon={faWhatsapp} />
              </a>
            </div>
          </div>

          <div className={styles.contactFormGlass}>
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <div className={styles.inputWithIcon}>
                  <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.formControl}
                    placeholder="Your Name"
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <div className={styles.inputWithIcon}>
                  <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.formControl}
                    placeholder="Your Email"
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <div className={styles.inputWithIcon}>
                  <FontAwesomeIcon icon={faMessage} className={styles.inputIcon} />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={styles.formControl}
                    placeholder="Your Message"
                    rows="5"
                    required
                  ></textarea>
                </div>
              </div>
              
              <button type="submit" className={styles.submitBtn}>
                Send Message <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          </div>
        </div>
        
        <div className={styles.mapContainer}>
          <div className={styles.mapPlaceholder}>
            <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.mapIcon} />
            <p>Based in Ghana</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;