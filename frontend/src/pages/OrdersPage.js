import React from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { fetcher } from '../services/api';
const STATUS_COLORS = {
  placed: 'badge-gold', confirmed: 'badge-gold', processing: 'badge-gold',
  shipped: 'badge-green', out_for_delivery: 'badge-green', delivered: 'badge-green',
  cancelled: 'badge-red', returned: 'badge-red',
};

export default function OrdersPage() {
  const { data, isLoading: loading } = useSWR('/orders/my-orders', fetcher);
  const orders = data?.orders || [];

  if (loading) return <div className="page-loader" style={{ paddingTop: 'var(--header-height)' }}><div className="spinner" /></div>;

  return (
    <div style={{ paddingTop: 'var(--header-height)' }}>
      <div className="container section">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 400, marginBottom: 40 }}>My Orders</h1>
        {orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>You haven't placed any orders. Start shopping!</p>
            <Link to="/shop" className="btn btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => (
              <div key={order._id} style={{ background: 'white', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)', padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 4 }}>{order.orderNumber}</p>
                    <p style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-gray'}`}>{order.orderStatus.replace(/_/g, ' ')}</span>
                    <strong style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>₹{order.pricing?.total?.toLocaleString()}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                  {order.items?.slice(0, 3).map(item => (
                    <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={item.image || 'https://via.placeholder.com/48'} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, background: 'var(--clr-cream)' }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && <span style={{ fontSize: 13, color: 'var(--clr-text-muted)', alignSelf: 'center' }}>+{order.items.length - 3} more</span>}
                </div>
                <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">View Details →</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
