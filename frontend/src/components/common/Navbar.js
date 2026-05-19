import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  const categories = ['Sofas', 'Beds', 'Dining', 'Office', 'Wardrobes', 'Outdoor'];

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner">
          {/* Mobile hamburger */}
          <button className="navbar__hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            <span /><span /><span />
          </button>

          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-text">FURNISHLY</span>
          </Link>

          {/* Desktop nav */}
          <nav className="navbar__nav">
            <Link to="/shop" className="navbar__link">All Products</Link>
            {categories.map(cat => (
              <Link key={cat} to={`/shop/${cat.toLowerCase()}`} className="navbar__link">{cat}</Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="navbar__actions">
            <button className="navbar__icon-btn" onClick={() => setSearchOpen(v => !v)} aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>

            {user && (
              <Link to="/wishlist" className="navbar__icon-btn" aria-label="Wishlist">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </Link>
            )}

            <Link to="/cart" className="navbar__icon-btn navbar__cart-btn" aria-label="Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {cartCount > 0 && <span className="navbar__cart-count">{cartCount}</span>}
            </Link>

            {user ? (
              <div className="navbar__user" onClick={() => setUserMenuOpen(v => !v)}>
                <div className="navbar__avatar">{user.name.charAt(0).toUpperCase()}</div>
                {userMenuOpen && (
                  <div className="navbar__user-menu">
                    <div className="navbar__user-info">
                      <span className="navbar__user-name">{user.name}</span>
                      <span className="navbar__user-email">{user.email}</span>
                    </div>
                    <div className="navbar__user-divider" />
                    <Link to="/profile" className="navbar__user-item">My Profile</Link>
                    <Link to="/orders" className="navbar__user-item">My Orders</Link>
                    <Link to="/wishlist" className="navbar__user-item">Wishlist</Link>
                    {user.role === 'admin' && <Link to="/admin" className="navbar__user-item navbar__user-item--admin">Admin Panel</Link>}
                    <div className="navbar__user-divider" />
                    <button className="navbar__user-item navbar__user-item--logout" onClick={handleLogout}>Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="navbar__search">
            <form onSubmit={handleSearch} className="navbar__search-form">
              <input
                autoFocus
                type="text"
                placeholder="Search for furniture..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="navbar__search-input"
              />
              <button type="submit" className="navbar__search-btn">Search</button>
              <button type="button" onClick={() => setSearchOpen(false)} className="navbar__search-close">✕</button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      <div className={`navbar__mobile-menu ${menuOpen ? 'navbar__mobile-menu--open' : ''}`}>
        <Link to="/shop" className="navbar__mobile-link">All Products</Link>
        {categories.map(cat => (
          <Link key={cat} to={`/shop/${cat.toLowerCase()}`} className="navbar__mobile-link">{cat}</Link>
        ))}
        <div className="navbar__mobile-divider" />
        {user ? (
          <>
            <Link to="/profile" className="navbar__mobile-link">My Profile</Link>
            <Link to="/orders" className="navbar__mobile-link">My Orders</Link>
            <Link to="/wishlist" className="navbar__mobile-link">Wishlist</Link>
            {user.role === 'admin' && <Link to="/admin" className="navbar__mobile-link">Admin Panel</Link>}
            <button className="navbar__mobile-link navbar__mobile-logout" onClick={handleLogout}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar__mobile-link">Sign In</Link>
            <Link to="/register" className="navbar__mobile-link">Create Account</Link>
          </>
        )}
      </div>
      {menuOpen && <div className="navbar__overlay" onClick={() => setMenuOpen(false)} />}
      {userMenuOpen && <div className="navbar__overlay navbar__overlay--transparent" onClick={() => setUserMenuOpen(false)} />}
    </>
  );
}
