import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderAPI } from '../services/api';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderAPI.getOne(id).then(r => setOrder(r.data.order)).catch(() => {});
  }, [id]);

  return (
    <div style={{ paddingTop: 'var(--header-height)', minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'var(--clr-cream)' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: '#d5f0e0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 36 }}>✓</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 300, marginBottom: 12 }}>Order Placed!</h1>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: 16, marginBottom: 32, lineHeight: 1.7 }}>
          Thank you for your order. We've sent a confirmation email and will keep you updated on the delivery status.
        </p>

        {order && (
          <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 28, marginBottom: 32, textAlign: 'left', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: 'var(--clr-text-muted)', fontSize: 13 }}>Order Number</span>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{order.orderNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: 'var(--clr-text-muted)', fontSize: 13 }}>Payment</span>
              <span style={{ fontSize: 14 }}>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: 'var(--clr-text-muted)', fontSize: 13 }}>Total</span>
              <strong style={{ fontSize: 16 }}>₹{order.pricing?.total?.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--clr-text-muted)', fontSize: 13 }}>Est. Delivery</span>
              <span style={{ fontSize: 14 }}>{order.estimatedDelivery ? new Date(order.estimatedDelivery).toDateString() : '7–10 business days'}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/orders/${id}`} className="btn btn-primary">Track Order</Link>
          <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
