import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './QuickViewModal.css';

const Stars = ({ rating, size = 14 }) => (
  <div style={{ display: 'flex', gap: 2, color: '#c9a96e' }}>
    {[1,2,3,4,5].map(s => (
      <svg key={s} width={size} height={size} viewBox="0 0 24 24"
        fill={s <= Math.round(rating) ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();

  if (!product) return null;

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, 1, {});
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="qv-overlay" onClick={handleOverlayClick}>
      <div className="qv-modal">
        <button className="qv-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="qv-image-wrap">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/500'}
            alt={product.name}
          />
          {discount > 0 && <span className="qv-discount">−{discount}%</span>}
        </div>

        <div className="qv-info">
          {product.brand && <p className="qv-brand">{product.brand}</p>}
          <h2 className="qv-name">{product.name}</h2>

          <div className="qv-rating">
            <Stars rating={product.ratings?.average || 0} />
            <span className="qv-rating-text">
              ({product.ratings?.count || 0} reviews)
            </span>
          </div>

          <div className="qv-price-row">
            <span className="qv-price">₹{effectivePrice.toLocaleString()}</span>
            {product.discountPrice > 0 && (
              <span className="qv-price-original">₹{product.price.toLocaleString()}</span>
            )}
          </div>

          <p className="qv-desc">
            {product.shortDescription || product.description?.slice(0, 150) + '...'}
          </p>

          <div className="qv-meta">
            <div className="qv-meta-item">
              <span>Delivery</span>
              <span>{product.deliveryDays || 7} days</span>
            </div>
            <div className="qv-meta-item">
              <span>Warranty</span>
              <span>{product.warrantyYears || 1} yr</span>
            </div>
            <div className="qv-meta-item">
              <span>Stock</span>
              <span>{product.stock > 0 ? `${product.stock} left` : 'Out'}</span>
            </div>
          </div>

          <div className="qv-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="qv-view-link"
            onClick={onClose}
          >
            View Full Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
