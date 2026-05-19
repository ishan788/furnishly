import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import QuickViewModal from './QuickViewModal';
import './ProductCard.css';

const StarRating = ({ rating, count }) => (
  <div className="pc-rating">
    <div className="stars">
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
    {count > 0 && <span className="pc-rating-count">({count})</span>}
  </div>
);

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = React.useState(false);
  const [quickView, setQuickView] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addToCart(product);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to add to wishlist'); return; }
    try {
      await userAPI.toggleWishlist(product._id);
      setWishlisted(v => !v);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch { toast.error('Something went wrong'); }
  };

  const discount = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <>
    <Link to={`/product/${product.slug}`} className="product-card">
      <div className="pc-image-wrap">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
          alt={product.name}
          className="pc-image"
          loading="lazy"
        />
        {discount > 0 && <span className="pc-discount">−{discount}%</span>}
        {product.isNewArrival && <span className="pc-badge pc-badge--new">New</span>}
        {product.stock === 0 && <div className="pc-out-of-stock">Out of Stock</div>}

        <div className="pc-actions">
          <button className={`pc-wishlist ${wishlisted ? 'pc-wishlist--active' : ''}`} onClick={handleWishlist} title="Add to Wishlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button className="pc-quickview-btn" onClick={(e) => { e.preventDefault(); setQuickView(true); }} title="Quick View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button className="pc-add-btn" onClick={handleAddToCart} disabled={product.stock === 0}>
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="pc-info">
        {product.brand && <span className="pc-brand">{product.brand}</span>}
        <h3 className="pc-name">{product.name}</h3>
        <StarRating rating={product.ratings?.average || 0} count={product.ratings?.count || 0} />
        <div className="pc-price">
          {product.discountPrice > 0 ? (
            <>
              <span className="pc-price-sale">₹{product.discountPrice.toLocaleString()}</span>
              <span className="pc-price-original">₹{product.price.toLocaleString()}</span>
            </>
          ) : (
            <span className="pc-price-sale">₹{product.price.toLocaleString()}</span>
          )}
        </div>
        {product.deliveryDays && (
          <p className="pc-delivery">Free delivery in {product.deliveryDays} days</p>
        )}
      </div>
    </Link>
    {quickView && <QuickViewModal product={product} onClose={() => setQuickView(false)} />}
    </>
  );
}
