import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, paymentAPI } from '../services/api';
import toast from 'react-hot-toast';

const INDIAN_STATES = ['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

export default function CheckoutPage() {
  const { cart, subtotal, shippingCharge, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];

  const [address, setAddress] = useState({
    fullName: defaultAddr?.fullName || user?.name || '',
    phone: defaultAddr?.phone || user?.phone || '',
    addressLine1: defaultAddr?.addressLine1 || '',
    addressLine2: defaultAddr?.addressLine2 || '',
    city: defaultAddr?.city || '',
    state: defaultAddr?.state || '',
    pincode: defaultAddr?.pincode || '',
    country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      const orderData = {
        items: cart.map(i => ({ product: i._id, quantity: i.quantity, variant: i.variant })),
        shippingAddress: address,
        paymentMethod,
      };

      const { data } = await orderAPI.create(orderData);
      const order = data.order;

      if (paymentMethod === 'cod') {
        clearCart();
        navigate(`/order-success/${order._id}`);
        return;
      }

      // Razorpay
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Razorpay SDK failed to load'); return; }

      const { data: rpData } = await paymentAPI.createRazorpayOrder(order._id);

      const options = {
        key: rpData.keyId,
        amount: rpData.amount,
        currency: rpData.currency,
        name: 'Furnishly',
        description: `Order ${order.orderNumber}`,
        order_id: rpData.razorpayOrderId,
        prefill: { name: user.name, email: user.email, contact: address.phone },
        theme: { color: '#1a1a18' },
        handler: async (response) => {
          try {
            await paymentAPI.verifyRazorpay({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });
            clearCart();
            navigate(`/order-success/${order._id}`);
          } catch { toast.error('Payment verification failed'); }
        },
        modal: { ondismiss: () => toast.error('Payment cancelled') },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 'var(--header-height)' }}>
      <div className="container section">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 400, marginBottom: 40 }}>Checkout</h1>
        <form onSubmit={handlePlaceOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'flex-start' }}>
            <div>
              {/* Shipping address */}
              <div style={{ background: 'white', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)', padding: 28, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24 }}>Shipping Address</h3>
                <div className="grid grid-2">
                  {[
                    { name: 'fullName', label: 'Full Name', type: 'text' },
                    { name: 'phone', label: 'Phone Number', type: 'tel' },
                  ].map(({ name, label, type }) => (
                    <div className="form-group" key={name}>
                      <label className="form-label">{label}</label>
                      <input name={name} type={type} className="form-input" value={address[name]} onChange={handleChange} required />
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label">Address Line 1</label>
                  <input name="addressLine1" className="form-input" value={address.addressLine1} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Address Line 2 (Optional)</label>
                  <input name="addressLine2" className="form-input" value={address.addressLine2} onChange={handleChange} />
                </div>
                <div className="grid grid-3">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input name="city" className="form-input" value={address.city} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <select name="state" className="form-input" value={address.state} onChange={handleChange} required>
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input name="pincode" className="form-input" value={address.pincode} onChange={handleChange} required pattern="[0-9]{6}" />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div style={{ background: 'white', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)', padding: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24 }}>Payment Method</h3>
                {[
                  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
                  { value: 'razorpay', label: 'Razorpay', desc: 'UPI, Cards, Net Banking & more', icon: '💳' },
                ].map(({ value, label, desc, icon }) => (
                  <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', border: `1.5px solid ${paymentMethod === value ? 'var(--clr-ink)' : 'var(--clr-border)'}`, borderRadius: 'var(--radius-md)', marginBottom: 12, cursor: 'pointer', transition: 'var(--transition)', background: paymentMethod === value ? 'var(--clr-cream)' : 'white' }}>
                    <input type="radio" name="paymentMethod" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} style={{ accentColor: 'var(--clr-ink)' }} />
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <div>
                      <strong style={{ display: 'block', fontSize: 15 }}>{label}</strong>
                      <span style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>{desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Order summary */}
            <div style={{ background: 'var(--clr-cream)', borderRadius: 'var(--radius-md)', padding: 28, position: 'sticky', top: 'calc(var(--header-height) + 24px)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 20 }}>Order Summary</h3>
              <div style={{ marginBottom: 20 }}>
                {cart.map(item => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                    <span style={{ flex: 1, marginRight: 12 }}>{item.name} × {item.quantity}</span>
                    <span style={{ fontWeight: 500 }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: 'var(--clr-border)', margin: '16px 0' }} />
              {[
                { label: 'Subtotal', value: `₹${subtotal.toLocaleString()}` },
                { label: 'Shipping', value: shippingCharge === 0 ? 'Free' : `₹${shippingCharge}` },
                { label: 'GST (18%)', value: `₹${tax.toLocaleString()}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                  <span style={{ color: 'var(--clr-text-muted)' }}>{label}</span><span>{value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--clr-border)', margin: '16px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Total</strong>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>₹{total.toLocaleString()}</strong>
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? 'Placing Order...' : paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
              </button>
              <p style={{ fontSize: 12, color: 'var(--clr-text-muted)', textAlign: 'center', marginTop: 12 }}>🔒 Secure checkout</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
