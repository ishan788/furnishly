import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import useSWRInfinite from 'swr/infinite';
import { productAPI, fetcher } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import './ShopPage.css';

const SORT_OPTIONS = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Best Rated', value: '-ratings.average' },
  { label: 'Most Popular', value: '-ratings.count' },
];

export default function ShopPage() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();

  const [filterOptions, setFilterOptions] = useState({ brands: [], materials: [], priceRange: { min: 0, max: 200000 }, roomTypes: [] });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const observerTarget = useRef(null);

  const [filters, setFilters] = useState({
    sort: searchParams.get('sort') || '-createdAt',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brand: searchParams.get('brand') || '',
    material: searchParams.get('material') || '',
    roomType: searchParams.get('roomType') || '',
    isFeatured: searchParams.get('isFeatured') || '',
    isNewArrival: searchParams.get('isNewArrival') || '',
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    productAPI.getFilterOptions().then(r => setFilterOptions(r.data.filters)).catch(() => {});
  }, []);

  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && (!previousPageData.products || !previousPageData.products.length)) return null; // reached the end
    const params = new URLSearchParams();
    Object.keys(filters).forEach(k => {
      if (filters[k]) params.append(k, filters[k]);
    });
    params.append('page', pageIndex + 1);
    params.append('limit', 12);
    if (category) params.append('category', category);
    return `/products?${params.toString()}`;
  };

  const { data, size, setSize, isValidating, error } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
    revalidateOnFocus: false, // Don't revalidate heavily on focus for infinite lists
  });

  const products = data ? data.flatMap(page => page.products) : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.products?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.products?.length < 12);
  const totalProducts = data ? data[0]?.pagination?.total : 0;

  // Infinite Scroll Observer
  useEffect(() => {
    if (error) return; // Prevent infinite loops if API fails
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isReachingEnd && !isLoadingMore) {
          setSize(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [isReachingEnd, isLoadingMore, setSize, error]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSize(1);
  };

  const clearFilters = () => {
    setFilters({ sort: '-createdAt', minPrice: '', maxPrice: '', brand: '', material: '', roomType: '', isFeatured: '', isNewArrival: '', search: '' });
    setSize(1);
  };

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.brand || filters.material || filters.roomType || filters.search;

  const FilterSidebar = () => (
    <aside className={`shop-filters ${filtersOpen ? 'shop-filters--open' : ''}`}>
      <div className="shop-filters__header">
        <h3>Filters</h3>
        {hasActiveFilters && <button className="shop-filters__clear" onClick={clearFilters}>Clear All</button>}
        <button className="shop-filters__close" onClick={() => setFiltersOpen(false)}>✕</button>
      </div>

      {/* Search */}
      <div className="filter-group">
        <label className="filter-label">Search</label>
        <input
          type="text" placeholder="Search products..." className="form-input"
          value={filters.search}
          onChange={e => updateFilter('search', e.target.value)}
        />
      </div>

      {/* Price */}
      <div className="filter-group">
        <label className="filter-label">Price Range</label>
        <div className="filter-price-row">
          <input type="number" placeholder="Min" className="form-input" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} />
          <span>—</span>
          <input type="number" placeholder="Max" className="form-input" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} />
        </div>
      </div>

      {/* Brands */}
      {filterOptions.brands.length > 0 && (
        <div className="filter-group">
          <label className="filter-label">Brand</label>
          <select className="form-input" value={filters.brand} onChange={e => updateFilter('brand', e.target.value)}>
            <option value="">All Brands</option>
            {filterOptions.brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      )}

      {/* Materials */}
      {filterOptions.materials.length > 0 && (
        <div className="filter-group">
          <label className="filter-label">Material</label>
          <select className="form-input" value={filters.material} onChange={e => updateFilter('material', e.target.value)}>
            <option value="">All Materials</option>
            {filterOptions.materials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      )}

      {/* Room type */}
      <div className="filter-group">
        <label className="filter-label">Room Type</label>
        <select className="form-input" value={filters.roomType} onChange={e => updateFilter('roomType', e.target.value)}>
          <option value="">All Rooms</option>
          {filterOptions.roomTypes.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Quick filters */}
      <div className="filter-group">
        <label className="filter-label">Quick Filters</label>
        <div className="filter-chips">
          {[
            { label: 'Featured', key: 'isFeatured', value: 'true' },
            { label: 'New Arrivals', key: 'isNewArrival', value: 'true' },
          ].map(({ label, key, value }) => (
            <button
              key={key}
              className={`filter-chip ${filters[key] === value ? 'filter-chip--active' : ''}`}
              onClick={() => updateFilter(key, filters[key] === value ? '' : value)}
            >{label}</button>
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="shop-page">
      <div className="shop-page__inner container">
        <FilterSidebar />
        {filtersOpen && <div className="shop-overlay" onClick={() => setFiltersOpen(false)} />}

        <div className="shop-main">
          {/* Toolbar */}
          <div className="shop-toolbar">
            <div className="shop-toolbar__left">
              <button className="shop-filter-btn" onClick={() => setFiltersOpen(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                Filters {hasActiveFilters && <span className="shop-filter-badge">•</span>}
              </button>
              {totalProducts > 0 && <span className="shop-count">{totalProducts} products</span>}
            </div>
            <select className="shop-sort" value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Products grid */}
          {error && !data ? (
            <div className="empty-state">
              <h3>Oops! Something went wrong</h3>
              <p>We couldn't load the products. Please try again.</p>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>Refresh Page</button>
            </div>
          ) : isLoadingInitialData ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : isEmpty ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="shop-grid">
              {products.map((p, idx) => <ProductCard key={`${p._id}-${idx}`} product={p} />)}
            </div>
          )}

          {/* Loading more indicator */}
          <div ref={observerTarget} style={{ height: '20px', margin: '20px 0', display: 'flex', justifyContent: 'center' }}>
            {isValidating && !isLoadingInitialData && <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }} />}
          </div>
          
          {isReachingEnd && !isEmpty && !isLoadingInitialData && (
            <div style={{ textAlign: 'center', color: 'var(--clr-text-muted)', padding: '20px 0' }}>
              You've reached the end of the catalog.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
