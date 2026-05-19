import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CustomCursor from './components/common/CustomCursor';
import ScrollProgress from './components/common/ScrollProgress';
import BackToTop from './components/common/BackToTop';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import WishlistPage from './pages/WishlistPage';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProductForm from './pages/admin/AdminProductForm';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const PublicLayout = ({ children }) => {
  const location = require('react-router-dom').useLocation();
  return (
    <>
      <Navbar />
      <main key={location.pathname} className="page-transition-enter" style={{ minHeight: 'calc(100vh - 72px)' }}>{children}</main>
      <Footer />
    </>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/shop" element={<PublicLayout><ShopPage /></PublicLayout>} />
      <Route path="/shop/:category" element={<PublicLayout><ShopPage /></PublicLayout>} />
      <Route path="/product/:slug" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
      <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />

      {/* Private */}
      <Route path="/checkout" element={<PrivateRoute><PublicLayout><CheckoutPage /></PublicLayout></PrivateRoute>} />
      <Route path="/order-success/:id" element={<PrivateRoute><PublicLayout><OrderSuccessPage /></PublicLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><PublicLayout><ProfilePage /></PublicLayout></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><PublicLayout><OrdersPage /></PublicLayout></PrivateRoute>} />
      <Route path="/orders/:id" element={<PrivateRoute><PublicLayout><OrderDetailPage /></PublicLayout></PrivateRoute>} />
      <Route path="/wishlist" element={<PrivateRoute><PublicLayout><WishlistPage /></PublicLayout></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/edit/:id" element={<AdminProductForm />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <CustomCursor />
      <ScrollProgress />
      <BackToTop />
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px', borderRadius: '4px' },
              success: { iconTheme: { primary: '#27ae60', secondary: '#fff' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
