import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartSidebar from './components/CartSidebar';
import AccountLayout from './pages/Account/AccountLayout';
import MyDetails from './pages/Account/MyDetails';
import MyOrders from './pages/Account/MyOrders';
import MyReviews from './pages/Account/MyReviews';
import AuthPage from './pages/Account/AuthPage';
import ProductGrid from './components/ProductGrid';
import ProductPage from './components/ProductPage';
import HomePage from './pages/Home/HomePage';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import AdminPanel from './pages/Admin/AdminPanel';
import CustomPage from './pages/Custom/CustomPage';
import CheckoutSuccess from './pages/Checkout/CheckoutSuccess';
import CheckoutCancel from './pages/Checkout/CheckoutCancel';
import SearchResultsPage from './pages/Search/SearchResultsPage';
import './App.css';
import Cart from './pages/Cart/Cart';

import { authService } from './services/authService';
import AboutPage from './pages/About/AboutPage';

// Initialize axios interceptors globally
authService.setupAxiosInterceptors();

function AppLayout({ onCartOpen }) {
  return (
    <div className="app-container">
      <Header onCartOpen={onCartOpen} />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout onCartOpen={() => setCartOpen(true)} />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ProductGrid />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="custom" element={<CustomPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="checkout/success" element={<CheckoutSuccess />} />
          <Route path="checkout/cancel" element={<CheckoutCancel />} />

          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<AuthPage />} />

          <Route path="account" element={<AccountLayout />}>
            <Route index element={<Navigate to="details" replace />} />
            <Route path="details" element={<MyDetails />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="reviews" element={<MyReviews />} />
          </Route>
        </Route>
        {/* Admin panel — outside AppLayout so it has its own full-page layout without site header/footer */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </Router>
  );
}

export default App;
