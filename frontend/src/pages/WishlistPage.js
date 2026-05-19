import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getWishlist()
      .then(r => setWishlist(r.data.wishlist))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader" style={{ paddingTop: 'var(--header-height)' }}><div className="spinner" /></div>;

  return (
    <div style={{ paddingTop: 'var(--header-height)' }}>
      <div className="container section">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 400, marginBottom: 8 }}>My Wishlist</h1>
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: 40 }}>{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
        {wishlist.length === 0 ? (
          <div className="empty-state">
            <h3>Your wishlist is empty</h3>
            <p>Save items you love by clicking the heart icon on any product.</p>
            <Link to="/shop" className="btn btn-primary">Explore Products</Link>
          </div>
        ) : (
          <div className="grid grid-4">
            {wishlist.map(product => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  );
}
