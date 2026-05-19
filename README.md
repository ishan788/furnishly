# 🪑 Furnishly — Full-Scale Furniture E-Commerce Platform

A production-grade MERN stack furniture e-commerce platform with a complete shopping experience, admin dashboard, Razorpay payments, and more.

---

## ✨ Features

### Customer-Facing
- 🏠 **Homepage** — Hero, featured products, category grid, new arrivals, testimonials
- 🛍 **Shop** — Advanced filters (price, brand, material, room type), sort, search, pagination
- 📦 **Product Detail** — Image gallery, variants, quantity selector, reviews & ratings
- 🛒 **Cart** — Persistent cart with real-time totals, GST calculation, free shipping threshold
- 💳 **Checkout** — Address management, Razorpay payment, Cash on Delivery
- 📧 **Order Tracking** — Visual status stepper, full order history
- ❤️ **Wishlist** — Save and manage favourite products
- 👤 **Profile** — Update info, password, manage saved addresses

### Admin Panel (`/admin`)
- 📊 **Dashboard** — Revenue, orders, users, top products with live stats
- 📦 **Product Management** — Create, edit, delete products with image upload
- 🧾 **Order Management** — Update statuses, filter by status, search by order number
- 👥 **User Management** — View all users, activate/deactivate accounts

### Technical
- 🔐 JWT authentication with refresh tokens
- 🖼 Cloudinary image upload
- 📧 Transactional emails (Nodemailer)
- 🔒 Rate limiting, CORS, Helmet security headers
- 💾 Redis-ready cart sessions (localStorage fallback)
- 📱 Fully responsive design

---

## 🗂 Project Structure

```
furnishly/
├── backend/
│   ├── config/          # DB, Cloudinary
│   ├── controllers/     # auth, product, order, payment, user, review, admin, category
│   ├── middleware/      # auth, error handling
│   ├── models/          # User, Product, Category, Order, Review
│   ├── routes/          # All API routes
│   ├── utils/           # generateToken, emailService, seeder
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # Navbar, Footer, ProductCard
        ├── context/     # AuthContext, CartContext
        ├── pages/       # All pages + Admin panel
        └── services/    # API client (axios)
```

---

## 🚀 Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd furnishly
npm run install-all
```

### 2. Configure backend environment

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
```

Required variables:
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `CLOUDINARY_*` | Cloudinary credentials (for image upload) |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `EMAIL_*` | SMTP credentials (Gmail recommended) |

### 3. Configure frontend environment

```bash
cd frontend
cp .env.example .env
# Add REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Seed the database

```bash
cd backend
npm run seed
```

This creates:
- ✅ Admin account: `admin@furnishly.com` / `Admin@123456`
- ✅ 8 product categories
- ✅ 8 sample furniture products with realistic data

### 5. Run the app

```bash
# From root — runs both backend and frontend
npm run dev

# Or separately:
npm run server   # Backend on :5000
npm run client   # Frontend on :3000
```

Open **http://localhost:3000** in your browser.

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/refresh-token` | — | Refresh access token |
| POST | `/api/auth/logout` | ✓ | Logout |
| GET | `/api/auth/me` | ✓ | Current user |
| PUT | `/api/auth/update-password` | ✓ | Change password |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | — | List products (filters, sort, pagination) |
| GET | `/api/products/:slugOrId` | — | Single product + related |
| GET | `/api/products/filters/options` | — | Filter options |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft delete |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | ✓ | Place order |
| GET | `/api/orders/my-orders` | ✓ | User's orders |
| GET | `/api/orders/:id` | ✓ | Order detail |
| PUT | `/api/orders/:id/cancel` | ✓ | Cancel order |

### Payments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/razorpay/create-order` | ✓ | Init Razorpay |
| POST | `/api/payments/razorpay/verify` | ✓ | Verify payment |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Admin | Stats |
| GET | `/api/admin/orders` | Admin | All orders |
| PUT | `/api/admin/orders/:id/status` | Admin | Update status |
| GET | `/api/admin/users` | Admin | All users |
| PUT | `/api/admin/users/:id/toggle-status` | Admin | Activate/deactivate |

---

## 🎨 Design System

The frontend uses a luxury editorial aesthetic:
- **Display font**: Cormorant Garamond (serif)
- **Body font**: DM Sans
- **Colors**: Warm white (`#fafaf8`), ink (`#1a1a18`), gold (`#c9a96e`)
- **Theme**: Warm, sophisticated, premium

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (access + refresh tokens) |
| Payments | Razorpay, Cash on Delivery |
| Images | Cloudinary |
| Email | Nodemailer |
| Security | Helmet, CORS, express-rate-limit |
| Styling | Custom CSS (no UI library) |

---

## 📦 Deployment

### Backend (e.g. Railway, Render, EC2)
```bash
cd backend
npm start
```
Set all environment variables in your hosting dashboard.

### Frontend (e.g. Vercel, Netlify)
```bash
cd frontend
npm run build
```
Set `REACT_APP_API_URL` to your deployed backend URL.

---

## 📝 License

MIT — free to use, modify, and distribute.

---

Built with ❤️ by Ishan using the MERN Stack.
