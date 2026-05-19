import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { SkeletonGrid } from '../components/common/Skeleton';
import useSWR from 'swr';
import { fetcher } from '../services/api';
import './HomePage.css';

const AnimatedCounter = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const StatsSection = () => (
  <section className="stats-section">
    <div className="container">
      <div className="stats-grid">
        {[
          { value: 15000, suffix: '+', label: 'Happy Customers' },
          { value: 500, suffix: '+', label: 'Handcrafted Pieces' },
          { value: 50, suffix: '+', label: 'Expert Artisans' },
          { value: 10, suffix: ' Yr', label: 'Warranty Promise' },
        ].map(({ value, suffix, label }) => (
          <div key={label} className="stat-item">
            <span className="stat-number">
              <AnimatedCounter end={value} suffix={suffix} />
            </span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const HeroSection = () => (
  <section className="hero">
    <div className="hero__content animate-fade-in-up">
      <p className="hero__eyebrow">New Collection 2026</p>
      <h1 className="hero__title">Where Comfort<br /><em>Meets Craft</em></h1>
      <p className="hero__sub">Handpicked furniture that transforms your house into a home. Timeless designs, lasting quality.</p>
      <div className="hero__ctas">
        <Link to="/shop" className="btn btn-primary btn-lg">Explore Collection</Link>
        <Link to="/shop?isFeatured=true" className="btn btn-outline btn-lg">View Lookbook</Link>
      </div>
    </div>
    <div className="hero__visual">
      <div className="hero__img-wrap">
        <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80" alt="Featured sofa" className="hero__img" />
      </div>
      <div className="hero__float hero__float--1">
        <span>Free delivery</span>
        <strong>Orders over ₹5,000</strong>
      </div>
      <div className="hero__float hero__float--2">
        <span>10-year</span>
        <strong>Warranty</strong>
      </div>
    </div>
  </section>
);

const TrustBar = () => (
  <div className="trust-bar">
    <div className="container">
      <div className="trust-bar__inner animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        {[
          { icon: '🚚', title: 'Free Delivery', desc: 'On orders above ₹5,000' },
          { icon: '↩', title: '30-Day Returns', desc: 'No questions asked' },
          { icon: '🛡', title: '10-Year Warranty', desc: 'On all furniture' },
          { icon: '💳', title: 'Easy EMI', desc: 'Zero cost options' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="trust-bar__item">
            <span className="trust-bar__icon">{icon}</span>
            <div>
              <strong>{title}</strong>
              <span>{desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function HomePage() {
  const { data: featRes, isLoading: loadingFeat } = useSWR('/products?isFeatured=true&limit=4', fetcher);
  const { data: newRes, isLoading: loadingNew } = useSWR('/products?isNewArrival=true&limit=4', fetcher);
  const { data: catRes, isLoading: loadingCat } = useSWR('/categories', fetcher);

  const featured = featRes?.products || [];
  const newArrivals = newRes?.products || [];
  const categories = catRes?.categories?.slice(0, 6) || [];
  const loading = loadingFeat || loadingNew || loadingCat;

  const catImages = {
    'Sofas & Couches': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=70',
    'Beds & Bedroom': 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=70',
    'Dining Tables': 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&q=70',
    'Office Chairs': 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400&q=70',
    'Wardrobes': 'https://images.unsplash.com/photo-1558997519-83ea9252efc8?w=400&q=70',
    'Coffee Tables': 'https://images.unsplash.com/photo-1611967164521-abae8fba4668?w=400&q=70',
  };

  return (
    <div className="home">
      <HeroSection />
      <TrustBar />

      {/* Categories */}
      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">Shop by Room</h2>
          <Link to="/shop" className="section-link">View All →</Link>
        </div>
        <div className="category-grid">
          {categories.map(cat => (
            <Link key={cat._id} to={`/shop/${cat.slug}`} className="cat-card">
              <div className="cat-card__img-wrap">
                <img src={catImages[cat.name] || 'https://via.placeholder.com/400'} alt={cat.name} className="cat-card__img" />
              </div>
              <div className="cat-card__label">
                <span>{cat.name}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="section" style={{ background: 'var(--clr-cream)' }}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Featured Pieces</h2>
              <Link to="/shop?isFeatured=true" className="section-link">See All →</Link>
            </div>
            {loading ? (
              <SkeletonGrid count={4} />
            ) : (
              <div className="grid grid-4">
                {featured.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Banner */}
      <section className="promo-banner">
        <div className="container promo-banner__inner">
          <div>
            <p className="promo-banner__eyebrow">Limited Time Offer</p>
            <h2 className="promo-banner__title">Up to 30% off<br />on Bedroom Furniture</h2>
            <Link to="/shop/beds" className="btn btn-gold btn-lg" style={{ marginTop: '24px' }}>Shop Bedroom</Link>
          </div>
          <img src="https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&q=80" alt="Bedroom" className="promo-banner__img" />
        </div>
      </section>

      {/* Stats */}
      <StatsSection />

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section container">
          <div className="section-header">
            <h2 className="section-title">New Arrivals</h2>
            <Link to="/shop?isNewArrival=true" className="section-link">See All →</Link>
          </div>
          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid grid-4">
              {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </section>
      )}

      {/* Testimonials */}
      <section className="section" style={{ background: 'var(--clr-ink)' }}>
        <div className="container text-center">
          <h2 className="section-title" style={{ color: 'var(--clr-gold-light)', marginBottom: '48px' }}>What Our Customers Say</h2>
          <div className="grid grid-3">
            {[
              { name: 'Priya S.', city: 'Mumbai', text: 'The quality of the sectional sofa exceeded my expectations. Delivery was on time and assembly team was professional.' },
              { name: 'Rahul M.', city: 'Delhi', text: 'Ordered the Emperor King Bed and it has completely transformed our bedroom. Solid teak, beautiful finish.' },
              { name: 'Ananya K.', city: 'Bangalore', text: 'The ErgoMaster chair is worth every rupee. My back pain has significantly reduced since I started using it.' },
            ].map(({ name, city, text }) => (
              <div key={name} className="testimonial-card">
                <div className="stars" style={{ justifyContent: 'center', marginBottom: '16px' }}>
                  {[1, 2, 3, 4, 5].map(s => <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>)}
                </div>
                <p className="testimonial-text">"{text}"</p>
                <div className="testimonial-author">
                  <strong>{name}</strong>
                  <span>{city}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
