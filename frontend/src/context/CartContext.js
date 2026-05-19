import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, variant = {}) => {
    setCart(prev => {
      const key = `${product._id}-${JSON.stringify(variant)}`;
      const existing = prev.find(i => `${i._id}-${JSON.stringify(i.variant)}` === key);
      if (existing) {
        toast.success('Quantity updated');
        return prev.map(i =>
          `${i._id}-${JSON.stringify(i.variant)}` === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      toast.success('Added to cart');
      return [...prev, {
        _id: product._id,
        name: product.name,
        price: product.discountPrice > 0 ? product.discountPrice : product.price,
        originalPrice: product.price,
        image: product.images?.[0] || '',
        slug: product.slug,
        stock: product.stock,
        variant,
        quantity,
      }];
    });
  };

  const removeFromCart = (productId, variant = {}) => {
    const key = `${productId}-${JSON.stringify(variant)}`;
    setCart(prev => prev.filter(i => `${i._id}-${JSON.stringify(i.variant)}` !== key));
    toast.success('Removed from cart');
  };

  const updateQuantity = (productId, variant, quantity) => {
    const key = `${productId}-${JSON.stringify(variant)}`;
    if (quantity < 1) { removeFromCart(productId, variant); return; }
    setCart(prev => prev.map(i =>
      `${i._id}-${JSON.stringify(i.variant)}` === key ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCharge = subtotal >= 5000 ? 0 : 299;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shippingCharge + tax;

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, subtotal, shippingCharge, tax, total,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
