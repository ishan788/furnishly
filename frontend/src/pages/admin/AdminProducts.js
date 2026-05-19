import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { productAPI, fetcher } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = new URLSearchParams({ page, limit: 15 });
  if (search) queryParams.append('search', search);

  const { data: resData, isLoading: loading, mutate } = useSWR(`/products?${queryParams.toString()}`, fetcher, { refreshInterval: 15000 });
  const products = resData?.products || [];
  const total = resData?.pagination?.total || 0;

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await productAPI.delete(id);
      toast.success('Product removed');
      mutate();
    } catch { toast.error('Failed to delete product'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Products</h1>
          <p>{total} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary">+ Add Product</Link>
      </div>

      <div className="admin-toolbar">
        <input placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="page-loader" style={{ padding: '60px 0' }}><div className="spinner" /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={product.images?.[0] || 'https://via.placeholder.com/48'} alt={product.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, background: 'var(--clr-cream)', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontWeight: 500, fontSize: 14 }}>{product.name}</p>
                        {product.brand && <p style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{product.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{product.category?.name}</td>
                  <td>
                    <p style={{ fontWeight: 500 }}>₹{(product.discountPrice > 0 ? product.discountPrice : product.price)?.toLocaleString()}</p>
                    {product.discountPrice > 0 && <p style={{ fontSize: 12, color: 'var(--clr-text-muted)', textDecoration: 'line-through' }}>₹{product.price?.toLocaleString()}</p>}
                  </td>
                  <td>
                    <span style={{ color: product.stock === 0 ? 'var(--clr-red)' : product.stock <= 10 ? '#e67e22' : 'var(--clr-green)', fontWeight: 500, fontSize: 14 }}>{product.stock}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {product.isFeatured && <span className="badge badge-gold" style={{ fontSize: 10 }}>Featured</span>}
                      {product.isNewArrival && <span className="badge badge-green" style={{ fontSize: 10 }}>New</span>}
                      {product.isBestseller && <span className="badge badge-gray" style={{ fontSize: 10 }}>Bestseller</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/admin/products/edit/${product._id}`} className="btn btn-outline btn-sm">Edit</Link>
                      <button className="btn btn-sm" style={{ borderColor: 'var(--clr-red)', color: 'var(--clr-red)', border: '1.5px solid' }} onClick={() => handleDelete(product._id, product.name)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {Math.ceil(total / 15) > 1 && (
        <div className="pagination" style={{ marginTop: 24 }}>
          {Array.from({ length: Math.ceil(total / 15) }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
