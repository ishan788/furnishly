import React, { useState, useEffect } from 'react';

const styles = {
  button: {
    position: 'fixed',
    bottom: 32,
    right: 32,
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'var(--clr-ink)',
    color: 'var(--clr-gold-light)',
    border: '1.5px solid rgba(201,169,110,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 900,
    boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: 'var(--font-body)',
  },
  hidden: {
    opacity: 0,
    transform: 'translateY(20px) scale(0.8)',
    pointerEvents: 'none',
  },
  visible: {
    opacity: 1,
    transform: 'translateY(0) scale(1)',
    pointerEvents: 'auto',
  },
};

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      style={{
        ...styles.button,
        ...(visible ? styles.visible : styles.hidden),
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--clr-gold)';
        e.currentTarget.style.color = 'white';
        e.currentTarget.style.transform = 'translateY(-3px) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(201,169,110,0.35)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--clr-ink)';
        e.currentTarget.style.color = 'var(--clr-gold-light)';
        e.currentTarget.style.transform = visible ? 'translateY(0) scale(1)' : '';
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.2)';
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
