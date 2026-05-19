import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function CartPage() {
  const { cart, removeFromCart, updateQuantity, subtotal, shippingCharge, tax, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div style={{ paddingTop: 'var(--header-height)' }}>
        <div className="empty-state section">
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 'var(--header-height)' }}>
      <div className="container section">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 400, marginBottom: 40 }}>Shopping Cart</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40, alignItems: 'flex-start' }}>
          <div>
            {cart.map(item => (
              <div key={`${item._id}-${JSON.stringify(item.variant)}`} style={{ display: 'flex', gap: 20, padding: '24px 0', borderBottom: '1px solid var(--clr-border)' }}>
                <Link to={`/product/${item.slug}`}>
                  <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 'var(--radius-sm)', background: 'var(--clr-cream)' }} />
                </Link>
                <div style={{ flex: 1 }}>
                  <Link to={`/product/${item.slug}`} style={{ fontFamily: 'var(--font-display)', fontSize: 20, display: 'block', marginBottom: 6 }}>{item.name}</Link>
                  {item.variant?.color && <p style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginBottom: 4 }}>Color: {item.variant.color}</p>}
                  <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>₹{item.price.toLocaleString()}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="pdp-qty" style={{ marginBottom: 0 }}>
                      <button onClick={() => updateQuantity(item._id, item.variant, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.variant, item.quantity + 1)}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(item._id, item.variant)} style={{ fontSize: 13, color: 'var(--clr-red)', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, whiteSpace: 'nowrap' }}>₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--clr-cream)', borderRadius: 'var(--radius-md)', padding: 28, position: 'sticky', top: 'calc(var(--header-height) + 24px)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24 }}>Order Summary</h3>
            {[
              { label: 'Subtotal', value: `₹${subtotal.toLocaleString()}` },
              { label: 'Shipping', value: shippingCharge === 0 ? 'Free' : `₹${shippingCharge}` },
              { label: 'GST (18%)', value: `₹${tax.toLocaleString()}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: 'var(--clr-text-muted)' }}>{label}</span>
                <span>{value}</span>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--clr-border)', margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Total</strong>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>₹{total.toLocaleString()}</strong>
            </div>
            {shippingCharge > 0 && <p style={{ fontSize: 12, color: 'var(--clr-green)', marginBottom: 16 }}>Add ₹{(5000 - subtotal).toLocaleString()} more for free shipping</p>}
            <button className="btn btn-primary btn-block btn-lg" onClick={() => user ? navigate('/checkout') : navigate('/login?redirect=/checkout')}>
              Proceed to Checkout
            </button>
            <Link to="/shop" className="btn btn-outline btn-block" style={{ marginTop: 12 }}>Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CartPage;
