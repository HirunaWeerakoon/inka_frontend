import { Search, User, ShoppingCart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { authService } from '../../services/authService';

export default function Header({ onCartOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const isActive = (path) => location.pathname === path;

  // Check authentication status and role
  const isAuthenticated = authService.isAuthenticated();
  const userDetails = authService.getUserDetails();
  const isAdmin = userDetails && userDetails.role === 'ADMIN';

  const handleLogin = () => {
    navigate('/login');
  };

  // const handleLogout = () => {
  //  authService.removeToken();
  //  window.location.href = '/';
  //};

  useEffect(() => {
    if (!isSearchOpen) return;
    searchInputRef.current?.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    if (location.pathname !== '/search') return;
    const params = new URLSearchParams(location.search);
    setSearchInput(params.get('q') || '');
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (location.pathname === '/search') return;
    setIsSearchOpen(false);
    setSearchInput('');
  }, [location.pathname]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchInput.trim();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSearchButtonClick = () => {
    if (!isSearchOpen) {
      setIsSearchOpen(true);
      return;
    }
    navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
  };

  return (
    <header className="header-container">
      <div className="header-logo">
        <Link to="/">
          <img
            src="/inka-logo.png"
            alt="INKA Apparel"
            style={{
              height: '70px', width: 'auto'
            }}
          />
        </Link>
      </div>
      <nav className="header-nav">
        <Link to="/" className={isActive('/') ? 'active' : ''}>HOME</Link>
        <Link to="/shop" className={isActive('/shop') ? 'active' : ''}>SHOP</Link>
        <Link to="/custom" className={isActive('/custom') ? 'active' : ''}>CUSTOM</Link>
        <Link to="/about" className={isActive('/about') ? 'active' : ''}>ABOUT</Link>
        {isAdmin && (
          <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>DASHBOARD</Link>
        )}
      </nav>
      <div className="header-actions">
        <form
          className={`header-search-form ${isSearchOpen ? 'header-search-form--open' : ''}`}
          onSubmit={handleSearchSubmit}
        >
          <input
            ref={searchInputRef}
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="header-search-input"
            placeholder="Search products"
            aria-label="Search products"
          />
        </form>
        <button aria-label="Search" onClick={handleSearchButtonClick}><Search size={24} /></button>

        {isAuthenticated ? (
          <Link to="/account" aria-label="User Account" className={isActive('/account') ? 'active-icon' : ''}>
            <User size={24} />
          </Link>
        ) : (
          <button aria-label="Login" onClick={handleLogin} title="Login with Google">
            <User size={24} />
          </button>
        )}

        <button aria-label="Shopping Cart" onClick={onCartOpen}>
          <ShoppingCart size={24} />
        </button>
      </div>
    </header>
  );
}
