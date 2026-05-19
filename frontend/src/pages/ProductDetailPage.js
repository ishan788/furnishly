import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI, reviewAPI, userAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';
import useSWR from 'swr';
import { fetcher } from '../services/api';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

const Stars = ({ rating, size = 16 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(s => (
      <svg key={s} width={size} height={size} viewBox="0 0 24 24"
        fill={s <= Math.round(rating) ? '#c9a96e' : 'none'}
        stroke="#c9a96e" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </div>
);

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const { data: prodData, isLoading: loading } = useSWR(slug ? `/products/${slug}` : null, fetcher);
  const product = prodData?.product;
  const related = prodData?.related || [];

  const { data: revData, mutate: mutateReviews } = useSWR(product ? `/reviews/product/${product._id}` : null, fetcher);
  const reviews = revData?.reviews || [];

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState({});
  const [activeTab, setActiveTab] = useState('description');
  const [wishlisted, setWishlisted] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty, selectedVariant);
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please sign in'); return; }
    try {
      await userAPI.toggleWishlist(product._id);
      setWishlisted(v => !v);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Error updating wishlist');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to review'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await reviewAPI.create({ productId: product._id, ...reviewForm });
      mutateReviews(prev => ({ ...prev, reviews: [data.review, ...(prev?.reviews || [])] }), false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="page-loader" style={{ paddingTop: 'var(--header-height)' }}>
      <div className="spinner" />
    </div>
  );
  if (!product) return null;

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="pdp" style={{ paddingTop: 'var(--header-height)' }}>
      <div className="container">
        <nav className="pdp-breadcrumb">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> /{' '}
          <Link to={`/shop/${product.category?.slug}`}>{product.category?.name}</Link> /{' '}
          <span>{product.name}</span>
        </nav>

        <div className="pdp-main">
          <div className="pdp-images">
            <div className="pdp-images__thumbnails">
              {(product.images || []).map((img, i) => (
                <button key={i}
                  className={`pdp-thumb ${activeImg === i ? 'pdp-thumb--active' : ''}`}
                  onClick={() => setActiveImg(i)}>
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
            <div className="pdp-images__main pdp-images__zoom-wrap">
              <img
                src={product.images?.[activeImg] || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="pdp-main-img pdp-main-img--zoomable"
              />
              {discount > 0 && <span className="pdp-discount-badge">−{discount}%</span>}
            </div>
          </div>

          <div className="pdp-info">
            {product.brand && <p className="pdp-brand">{product.brand}</p>}
            <h1 className="pdp-title">{product.name}</h1>

            <div className="pdp-rating-row">
              <Stars rating={product.ratings?.average || 0} />
              <span className="pdp-rating-count">
                {(product.ratings?.average || 0).toFixed(1)} ({product.ratings?.count || 0} reviews)
              </span>
            </div>

            <div className="pdp-price-row">
              <span className="pdp-price">₹{effectivePrice.toLocaleString()}</span>
              {product.discountPrice > 0 && (
                <>
                  <span className="pdp-price-original">₹{product.price.toLocaleString()}</span>
                  <span className="discount-tag">{discount}% off</span>
                </>
              )}
            </div>

            {product.shortDescription && (
              <p className="pdp-short-desc">{product.shortDescription}</p>
            )}

            {product.variants?.length > 0 && (
              <div className="pdp-variants">
                <p className="pdp-section-label">Options</p>
                <div className="pdp-variant-list">
                  {product.variants.map((v, i) => (
                    <button key={i}
                      className={`pdp-variant-btn ${
                        selectedVariant?.color === v.color ? 'pdp-variant-btn--active' : ''
                      }`}
                      onClick={() => setSelectedVariant({ color: v.color, material: v.material, size: v.size })}>
                      {v.colorHex && <span className="pdp-color-dot" style={{ background: v.colorHex }} />}
                      {v.color || v.material || v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pdp-qty-row">
              <p className="pdp-section-label">Quantity</p>
              <div className="pdp-qty">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <span className="pdp-stock">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <div className="pdp-ctas">
              <button className="btn btn-primary btn-lg btn-block"
                onClick={handleAddToCart} disabled={product.stock === 0}>
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                className={`pdp-wishlist-btn ${wishlisted ? 'pdp-wishlist-btn--active' : ''}`}
                onClick={handleWishlist} title="Add to Wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24"
                  fill={wishlisted ? 'currentColor' : 'none'}
                  stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>

            <div className="pdp-meta">
              {[
                { label: 'Delivery', value: `${product.deliveryDays || 7} business days` },
                { label: 'Warranty', value: `${product.warrantyYears || 1} year` },
                { label: 'Returns', value: `${product.returnDays || 30} days` },
                { label: 'Assembly', value: product.assemblyRequired ? 'Required' : 'Not required' },
              ].map(({ label, value }) => (
                <div key={label} className="pdp-meta-item">
                  <span className="pdp-meta-label">{label}</span>
                  <span className="pdp-meta-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pdp-tabs">
          <div className="pdp-tab-nav">
            {['description', 'details', 'reviews'].map(tab => (
              <button key={tab}
                className={`pdp-tab-btn ${activeTab === tab ? 'pdp-tab-btn--active' : ''}`}
                onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reviews' && ` (${reviews.length})`}
              </button>
            ))}
          </div>

          <div className="pdp-tab-content">
            {activeTab === 'description' && (
              <div className="pdp-description">
                <p>{product.description}</p>
                {product.features?.length > 0 && (
                  <>
                    <h4>Key Features</h4>
                    <ul>{product.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="pdp-details-grid">
                {product.dimensions && (
                  <div className="pdp-detail-group">
                    <h4>Dimensions</h4>
                    {[
                      ['Length', product.dimensions.length, product.dimensions.unit || 'cm'],
                      ['Width',  product.dimensions.width,  product.dimensions.unit || 'cm'],
                      ['Height', product.dimensions.height, product.dimensions.unit || 'cm'],
                      ['Weight', product.dimensions.weight, product.dimensions.weightUnit || 'kg'],
                    ].filter(([, v]) => v).map(([label, value, unit]) => (
                      <div key={label} className="pdp-spec-row">
                        <span>{label}</span><span>{value} {unit}</span>
                      </div>
                    ))}
                  </div>
                )}
                {product.materials?.length > 0 && (
                  <div className="pdp-detail-group">
                    <h4>Materials</h4>
                    {product.materials.map((m, i) => (
                      <div key={i} className="pdp-spec-row">
                        <span>Material {i + 1}</span><span>{m}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="pdp-reviews">
                {user && (
                  <form className="review-form" onSubmit={handleReviewSubmit}>
                    <h4>Write a Review</h4>
                    <div className="review-form__rating">
                      <label className="filter-label">Your Rating</label>
                      <div className="review-stars">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button"
                            onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                            style={{ color: s <= reviewForm.rating ? '#c9a96e' : '#ccc' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Title</label>
                      <input className="form-input" placeholder="Summarize your review"
                        value={reviewForm.title}
                        onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Review</label>
                      <textarea className="form-input" rows={4}
                        placeholder="Share your experience..."
                        value={reviewForm.comment}
                        onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                        required style={{ resize: 'vertical' }} />
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {reviews.length === 0 ? (
                  <p className="text-muted" style={{ padding: '32px 0' }}>
                    No reviews yet. Be the first to review!
                  </p>
                ) : (
                  <div className="review-list">
                    {reviews.map(r => (
                      <div key={r._id} className="review-item">
                        <div className="review-item__header">
                          <div className="review-item__avatar">{r.user?.name?.charAt(0)}</div>
                          <div>
                            <strong>{r.user?.name}</strong>
                            {r.isVerifiedPurchase && (
                              <span className="badge badge-green" style={{ marginLeft: 8, fontSize: 10 }}>Verified</span>
                            )}
                            <div><Stars rating={r.rating} size={13} /></div>
                          </div>
                          <span className="review-item__date">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h5 className="review-item__title">{r.title}</h5>
                        <p className="review-item__comment">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="section">
            <h2 className="section-title" style={{ marginBottom: 32 }}>You May Also Like</h2>
            <div className="grid grid-4">
              {related.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
