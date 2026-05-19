import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Footer.css';

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    toast.success('Thanks for subscribing! 🎉');
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <form className="footer__newsletter-form" onSubmit={handleSubmit}>
      <div className="footer__newsletter-input-wrap">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="footer__newsletter-input"
          required
        />
        <button type="submit" className="footer__newsletter-btn" disabled={submitted}>
          {submitted ? '✓ Subscribed' : 'Subscribe'}
        </button>
      </div>
      <p className="footer__newsletter-privacy">No spam ever. Unsubscribe anytime.</p>
    </form>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top container">
        <div className="footer__brand">
          <span className="footer__logo">FURNISHLY</span>
          <p className="footer__tagline">Crafting spaces that tell your story. Premium furniture for the modern home.</p>
          <div className="footer__socials">
            {['Instagram', 'Pinterest', 'Facebook'].map(s => (
              <a key={s} href="#!" className="footer__social">{s}</a>
            ))}
          </div>
        </div>
        <div className="footer__links">
          <div className="footer__col">
            <h4>Shop</h4>
            <Link to="/shop">All Products</Link>
            <Link to="/shop/sofas">Sofas & Couches</Link>
            <Link to="/shop/beds">Beds & Bedroom</Link>
            <Link to="/shop/dining">Dining Tables</Link>
            <Link to="/shop/office">Office Chairs</Link>
          </div>
          <div className="footer__col">
            <h4>Account</h4>
            <Link to="/profile">My Profile</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/login">Sign In</Link>
          </div>
          <div className="footer__col">
            <h4>Support</h4>
            <a href="#!">Help Center</a>
            <a href="#!">Track Order</a>
            <a href="#!">Returns & Refunds</a>
            <a href="#!">Assembly Guide</a>
            <a href="#!">Contact Us</a>
          </div>
        </div>
      </div>
      <div className="footer__newsletter container">
        <div className="footer__newsletter-inner">
          <div className="footer__newsletter-text">
            <h3>Stay in the Loop</h3>
            <p>Get early access to new collections, exclusive offers, and design inspiration.</p>
          </div>
          <NewsletterForm />
        </div>
      </div>
      <div className="footer__bottom container">
        <p>© {new Date().getFullYear()} Furnishly. All rights reserved.</p>
        <div className="footer__legal">
          <a href="#!">Privacy Policy</a>
          <a href="#!">Terms of Service</a>
          <a href="#!">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
