import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

interface DishImageProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  fallbackBg?: string;
  className?: string;
}

export const DishImage: React.FC<DishImageProps> = ({
  src,
  alt,
  fallbackTitle,
  fallbackBg = '#FFF1F2',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-3 text-center ${className}`}
        style={{ backgroundColor: fallbackBg }}
      >
        <Utensils className="w-7 h-7 text-rose-500 mb-1.5" />
        <span className="font-display font-bold text-xs text-stone-700">
          {fallbackTitle}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
