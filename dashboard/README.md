
 POS Management System

A modern Point of Sale (POS) management system for handling products, orders, reports, and inventory. Built with a React.js frontend and a secure Node.js backend, this system streamlines business operations, providing a seamless user experience.


 Features

 Frontend
- Homepage: Dashboard for quick navigation to key sections: Products, Orders, Reports, and Cart.
- Product Management:
  - Add, delete, and view products.
  - Organized product display for easy management.
- Order Management:
  - Track and manage orders.
  - Update order statuses (e.g., pending, confirmed, delivered).
- Reports:
  - Generate visualized reports using Chart.js.
  - Export reports in CSV format.
- Cart Management:
  - Add/remove items with dynamic price calculation.
- Authentication:
  - Login and signup with JWT authentication.

 Backend
- Secure API endpoints for managing products, orders, and users.
- User authentication using JWT.
- MongoDB for reliable data storage.
- Cloudinary integration for product image uploads.

---

 Tech Stack

 Frontend:
- React.js
- Redux Toolkit
- Redux Persist
- React Router Dom
- Axios
- Chart.js

 Backend:
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Cloudinary

---

 Features at a Glance

| Feature                | Description                                   |

| Products           | Manage product inventory                     |
| Orders             | Real-time order tracking and status updates  |
| Reports            | Generate and export business performance data|
| Cart               | Dynamic cart with price calculations         |
| Authentication     | Secure login and signup with JWT             |



 Setup Instructions

 Backend Setup
1. Navigate to the backend directory:
  
   cd backend

2. Install dependencies:
   npm install
   
3. Create a `.env` file and add the following:

   mongoURI="your_mongodb_connection_string"
   CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
   CLOUDINARY_API_KEY="your_cloudinary_api_key"
   CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
   JWT_SECRET_KEY="your_jwt_secret_key"
   JWT_REFRESH_KEY="your_refresh_secret_key"
   JWT_EXPIRES="150y"
   SMPT_HOST="smtp.gmail.com"
   SMTP_PORT=465
   SMPT_PASSWORD="your_email_password"
   EMAIL_USERNAME="your_email"
   REACT_APP_API_BASE_URL="http://localhost:8000/api/v1"
   ```
4. Start the backend server:
 
   npm run dev
   ```

 Frontend Setup
1. Navigate to the frontend directory:
   cd products
   ```
2. Install dependencies:
   npm install
   ```
3. Start the frontend:
   npm start
   ```

---

 Folder Structure

 Frontend:
- `src/`
  - `components/`: Reusable components like `Header`, `CartPage`, etc.
  - `admin/`: Admin views for managing orders, reports, and products.
  - `redux/`: Redux setup and slices for cart, auth, and products.
  - `pages/`: Authentication pages (`LoginPage`, `SignupPage`).
  - `utils/`: Helper utilities like `setAuthToken`.

 Backend:
- `controllers/`: Handles API request logic (e.g., `UserController`).
- `models/`: MongoDB models (e.g., `UserModel`, `ProductModel`).
- `routes/`: API endpoints (e.g., `/auth`, `/products`).
- `middleware/`: Authentication and validation middlewares.

---

 API Endpoints

 Authentication
- POST `/auth/user`: Authenticate and get a token.
- GET `/auth`: Get the authenticated user’s details.

 Product Management
- GET `/products`: Fetch all products.
- POST `/products`: Add a new product.
- DELETE `/products/:id`: Delete a product.

 Order Management
- GET `/orders`: Fetch all orders.
- POST `/orders`: Create a new order.

---

 Environment Variables

Add these variables to your `.env` file:

| Variable               | Description                                 |
|------------------------|---------------------------------------------|
| `mongoURI`             | MongoDB connection string                  |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud name                      |
| `CLOUDINARY_API_KEY`   | Cloudinary API key                         |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret                      |
| `JWT_SECRET_KEY`       | JWT secret key                             |
| `JWT_REFRESH_KEY`      | JWT refresh token secret                   |
| `JWT_EXPIRES`          | JWT expiration duration                    |
| `SMPT_HOST`            | SMTP server host                          |
| `SMTP_PORT`            | SMTP server port                          |
| `SMPT_PASSWORD`        | SMTP server password                      |
| `EMAIL_USERNAME`       | Email username for SMTP                   |
| `REACT_APP_API_BASE_URL`| Base URL for frontend API calls           |

---

 Scripts

 Backend:
- `npm run dev`: Starts the backend server in development mode.

 Frontend:
- `npm start`: Starts the React development server.

link to hosted project 
https://testpos.onrender.com/admin/home

github 
https://github.com/BatsaIke/testPOS

