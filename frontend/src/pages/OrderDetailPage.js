import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
const STEP_LABELS = { placed: 'Placed', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered' };

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderAPI.getOne(id).then(r => setOrder(r.data.order)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await orderAPI.cancel(id, 'Customer requested cancellation');
      setOrder(data.order);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order');
    } finally { setCancelling(false); }
  };

  if (loading) return <div className="page-loader" style={{ paddingTop: 'var(--header-height)' }}><div className="spinner" /></div>;
  if (!order) return null;

  const currentStep = STEPS.indexOf(order.orderStatus);
  const isCancelled = ['cancelled', 'returned'].includes(order.orderStatus);
  const canCancel = ['placed', 'confirmed', 'processing'].includes(order.orderStatus);

  return (
    <div style={{ paddingTop: 'var(--header-height)' }}>
      <div className="container section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Link to="/orders" style={{ fontSize: 13, color: 'var(--clr-text-muted)', display: 'block', marginBottom: 8 }}>← Back to Orders</Link>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 400 }}>Order {order.orderNumber}</h1>
          </div>
          {canCancel && (
            <button className="btn btn-outline" onClick={handleCancel} disabled={cancelling} style={{ borderColor: 'var(--clr-red)', color: 'var(--clr-red)' }}>
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'flex-start' }}>
          <div>
            {/* Progress tracker */}
            {!isCancelled && (
              <div style={{ background: 'white', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)', padding: 28, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 24 }}>Order Status</h3>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ position: 'absolute', top: 14, left: '8%', right: '8%', height: 2, background: 'var(--clr-border)', zIndex: 0 }} />
                  <div style={{ position: 'absolute', top: 14, left: '8%', height: 2, width: `${Math.max(0, currentStep / (STEPS.length - 1)) * 84}%`, background: 'var(--clr-ink)', zIndex: 1, transition: 'width 0.5s ease' }} />
                  {STEPS.map((step, i) => (
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2, flex: 1 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= currentStep ? 'var(--clr-ink)' : 'white', border: `2px solid ${i <= currentStep ? 'var(--clr-ink)' : 'var(--clr-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, transition: 'all 0.3s' }}>
                        {i < currentStep ? '✓' : i === currentStep ? '●' : ''}
                      </div>
                      <span style={{ fontSize: 11, textAlign: 'center', color: i <= currentStep ? 'var(--clr-ink)' : 'var(--clr-text-muted)', fontWeight: i === currentStep ? 500 : 400 }}>{STEP_LABELS[step]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isCancelled && (
              <div style={{ background: '#fde8e8', border: '1px solid #f5c1c1', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 24 }}>
                <p style={{ color: 'var(--clr-red)', fontWeight: 500 }}>Order {order.orderStatus}</p>
                {order.cancelReason && <p style={{ color: 'var(--clr-red)', fontSize: 14, marginTop: 4 }}>{order.cancelReason}</p>}
              </div>
            )}

            {/* Items */}
            <div style={{ background: 'white', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)', padding: 28, marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 20 }}>Items ({order.items?.length})</h3>
              {order.items?.map(item => (
                <div key={item._id} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--clr-border)' }}>
                  <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)', background: 'var(--clr-cream)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 4 }}>{item.name}</p>
                    {item.variant?.color && <p style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>Color: {item.variant.color}</p>}
                    <p style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Shipping address */}
            <div style={{ background: 'white', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)', padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 16 }}>Shipping Address</h3>
              <p style={{ fontWeight: 500 }}>{order.shippingAddress?.fullName}</p>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: 14, lineHeight: 1.7 }}>
                {order.shippingAddress?.addressLine1}{order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.pincode}<br />
                {order.shippingAddress?.phone}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--clr-cream)', borderRadius: 'var(--radius-md)', padding: 28, position: 'sticky', top: 'calc(var(--header-height) + 24px)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 20 }}>Order Summary</h3>
            {[
              { label: 'Subtotal', value: `₹${order.pricing?.subtotal?.toLocaleString()}` },
              { label: 'Shipping', value: order.pricing?.shippingCharge === 0 ? 'Free' : `₹${order.pricing?.shippingCharge}` },
              { label: 'Tax (GST)', value: `₹${order.pricing?.tax?.toLocaleString()}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: 'var(--clr-text-muted)' }}>{label}</span><span>{value}</span>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--clr-border)', margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Total</strong>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>₹{order.pricing?.total?.toLocaleString()}</strong>
            </div>
            <div style={{ background: 'white', borderRadius: 'var(--radius-sm)', padding: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginBottom: 4 }}>Payment Method</p>
              <p style={{ fontWeight: 500, fontSize: 14 }}>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</p>
              <p style={{ fontSize: 12, color: order.paymentStatus === 'paid' ? 'var(--clr-green)' : 'var(--clr-gold)', marginTop: 4, fontWeight: 500 }}>
                {order.paymentStatus?.toUpperCase()}
              </p>
            </div>
            {order.trackingNumber && (
              <div style={{ marginTop: 16, background: 'white', borderRadius: 'var(--radius-sm)', padding: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginBottom: 4 }}>Tracking Number</p>
                <p style={{ fontWeight: 500, fontFamily: 'monospace' }}>{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
