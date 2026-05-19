import React from 'react';
import './Skeleton.css';

export function SkeletonProductCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-card__image" />
      <div className="skeleton-card__body">
        <div className="skeleton skeleton-card__brand" />
        <div className="skeleton skeleton-card__title" />
        <div className="skeleton skeleton-card__stars" />
        <div className="skeleton skeleton-card__price" />
        <div className="skeleton skeleton-card__delivery" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="grid grid-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}
