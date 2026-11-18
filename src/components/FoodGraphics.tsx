import React from 'react';
import { CookStatus, DishBaseId, ToppingId } from '../types/game';

interface DishSpriteProps {
  dishId: DishBaseId;
  status?: CookStatus;
  toppings?: ToppingId[];
  size?: 'sm' | 'md' | 'lg';
}

export const DishSprite: React.FC<DishSpriteProps> = ({
  dishId,
  status = 'cooked',
  toppings = [],
  size = 'md',
}) => {
  const dim =
    size === 'sm' ? 'w-11 h-11' : size === 'lg' ? 'w-20 h-20' : 'w-16 h-16';

  const isRaw = status === 'cooking';
  const isBurned = status === 'burned';

  return (
    <svg viewBox="0 0 100 84" className={`${dim} drop-shadow-sm select-none`}>
      {/* 1. Crispy Club Sandwich Base */}
      {dishId === 'sandwich' && (
        <g>
          {/* Toasted Brioche Slice */}
          <path
            d="M 16 50 L 50 22 L 84 50 L 80 64 L 20 64 Z"
            fill={isBurned ? '#1C1917' : isRaw ? '#FEF3C7' : '#D97706'}
            stroke="#29160E"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path
            d="M 21 48 L 50 26 L 79 48 L 50 58 Z"
            fill={isBurned ? '#292524' : isRaw ? '#FFFBEB' : '#FBBF24'}
            stroke="#29160E"
            strokeWidth="2"
          />
          {/* Melted center sheen when toasted */}
          {!isRaw && !isBurned && (
            <path d="M 30 46 Q 50 52 70 46" stroke="#FDE047" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          )}

          {/* Toppings: Crisp Greens + Sliced Tomato */}
          {!isBurned && toppings.includes('greens') && (
            <path
              d="M 20 51 Q 30 43 40 51 Q 50 43 60 51 Q 70 43 80 51 L 76 57 L 24 57 Z"
              fill="#22C55E"
              stroke="#14532D"
              strokeWidth="2"
            />
          )}
          {!isBurned && toppings.includes('tomato') && (
            <g>
              <circle cx="38" cy="48" r="7" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1.8" />
              <circle cx="62" cy="48" r="7" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1.8" />
              <circle cx="37" cy="46" r="2" fill="#FCA5A5" />
              <circle cx="61" cy="46" r="2" fill="#FCA5A5" />
            </g>
          )}
        </g>
      )}

      {/* 2. Strawberry Cloud Cake Base */}
      {dishId === 'cake' && (
        <g>
          {/* Sponge Cake Tier */}
          <rect
            x="19"
            y="30"
            width="62"
            height="36"
            rx="10"
            fill={isBurned ? '#1C1917' : isRaw ? '#FEF9C3' : '#F6C28B'}
            stroke="#29160E"
            strokeWidth="2.8"
          />
          {!isBurned && (
            <path
              d="M 21 48 Q 35 53 50 48 Q 65 43 79 48"
              stroke={isRaw ? '#FDE68A' : '#FFF1F2'}
              strokeWidth="4.5"
              fill="none"
            />
          )}

          {/* Topping 1: Whipped Cream Swirls */}
          {!isBurned && toppings.includes('cream') && (
            <g>
              <path
                d="M 18 33 Q 33 42 50 32 Q 67 42 82 33 Q 78 21 50 21 Q 22 21 18 33 Z"
                fill="#FFFDF9"
                stroke="#29160E"
                strokeWidth="2.3"
              />
              <circle cx="35" cy="21" r="6" fill="#FFFFFF" stroke="#29160E" strokeWidth="1.8" />
              <circle cx="50" cy="19" r="7" fill="#FFFFFF" stroke="#29160E" strokeWidth="1.8" />
              <circle cx="65" cy="21" r="6" fill="#FFFFFF" stroke="#29160E" strokeWidth="1.8" />
            </g>
          )}

          {/* Topping 2: Fresh Strawberries */}
          {!isBurned && toppings.includes('strawberries') && (
            <g>
              <path d="M 35 12 C 40 12 42 19 35 23 C 28 19 30 12 35 12 Z" fill="#E11D48" stroke="#29160E" strokeWidth="1.8" />
              <path d="M 50 8 C 56 8 58 17 50 22 C 42 17 44 8 50 8 Z" fill="#E11D48" stroke="#29160E" strokeWidth="1.8" />
              <path d="M 65 12 C 70 12 72 19 65 23 C 58 19 60 12 65 12 Z" fill="#E11D48" stroke="#29160E" strokeWidth="1.8" />
              <path d="M 47 8 L 50 4 L 53 8" stroke="#16A34A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            </g>
          )}
        </g>
      )}

      {/* 3. Choco-Nut Stuffed Dates Base */}
      {dishId === 'dates' && (
        <g>
          {[
            { cx: 33, cy: 38, rot: -14 },
            { cx: 65, cy: 36, rot: 14 },
            { cx: 49, cy: 55, rot: 3 },
          ].map((d, i) => (
            <g key={i} transform={`translate(${d.cx}, ${d.cy}) rotate(${d.rot})`}>
              <ellipse
                cx="0"
                cy="0"
                rx="17"
                ry="10"
                fill={isBurned ? '#1C1917' : isRaw ? '#92400E' : '#6D2E1A'}
                stroke="#29160E"
                strokeWidth="2.4"
              />
              <ellipse
                cx="0"
                cy="-1.5"
                rx="11"
                ry="4.2"
                fill={isBurned ? '#292524' : '#B45309'}
              />

              {/* Topping 1: Roasted Almonds & Peanuts */}
              {!isBurned && toppings.includes('nuts') && (
                <g>
                  <ellipse cx="-4" cy="-2" rx="5" ry="2.8" fill="#D97706" stroke="#451A03" strokeWidth="1.4" />
                  <circle cx="4" cy="-2.5" r="2.6" fill="#FDE68A" stroke="#451A03" strokeWidth="1.2" />
                  <circle cx="8" cy="-1" r="2.3" fill="#FDE68A" stroke="#451A03" strokeWidth="1.2" />
                </g>
              )}

              {/* Topping 2: Glossy Chocolate Sauce Drizzle */}
              {!isBurned && toppings.includes('chocolate') && (
                <path
                  d="M -11 -4 Q -5 5 0 -4 Q 5 5 11 -4"
                  fill="none"
                  stroke="#3B180B"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                />
              )}
            </g>
          ))}
        </g>
      )}

      {/* Charred Burned Marker */}
      {isBurned && (
        <g stroke="#DC2626" strokeWidth="2.8" strokeLinecap="round" opacity="0.9">
          <line x1="40" y1="32" x2="60" y2="52" />
          <line x1="60" y1="32" x2="40" y2="52" />
        </g>
      )}
    </svg>
  );
};

export const DrinkGlassSprite: React.FC<{ size?: 'sm' | 'md'; filling?: number }> = ({
  size = 'md',
  filling = 1,
}) => {
  const cls = size === 'sm' ? 'w-9 h-11' : 'w-12 h-14';
  return (
    <svg viewBox="0 0 60 72" className={`${cls} drop-shadow-xs select-none`}>
      <path
        d="M 14 14 L 46 14 L 41 62 L 19 62 Z"
        fill="rgba(255,255,255,0.85)"
        stroke="#3B231A"
        strokeWidth="2.4"
      />
      {filling > 0.05 && (
        <g>
          <path
            d={`M ${19 - filling * 2} 60 L ${41 + filling * 2} 60 L 42 ${60 - filling * 22} L 18 ${60 - filling * 22} Z`}
            fill="#F59E0B"
          />
          {filling > 0.45 && (
            <path
              d={`M 17 ${60 - filling * 20} L 43 ${60 - filling * 20} L 44 ${60 - filling * 40} L 16 ${60 - filling * 40} Z`}
              fill="#FB7185"
            />
          )}
        </g>
      )}
      {filling >= 0.95 && (
        <>
          <circle cx="44" cy="14" r="9" fill="#FB923C" stroke="#3B231A" strokeWidth="2" />
          <circle cx="44" cy="14" r="6" fill="#FDE68A" />
          <path d="M 28 40 L 22 5 L 14 3" fill="none" stroke="#E11D48" strokeWidth="3.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};

export const CustomerAvatar: React.FC<{
  type: number;
  mood: 'happy' | 'waiting' | 'impatient' | 'delighted';
}> = ({ type, mood }) => {
  const palettes = [
    { hair: '#3B231A', skin: '#FCD5B5', outfit: '#2563EB' },
    { hair: '#FBBF24', skin: '#FFE4C4', outfit: '#E11D48' },
    { hair: '#1E293B', skin: '#D99B72', outfit: '#059669' },
    { hair: '#7C2D12', skin: '#FDE2C8', outfit: '#9333EA' },
    { hair: '#0F172A', skin: '#8D5524', outfit: '#EA580C' },
    { hair: '#BE123C', skin: '#FCD5B5', outfit: '#0284C7' },
  ];
  const p = palettes[type % palettes.length];

  return (
    <svg viewBox="0 0 80 86" className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 drop-shadow-sm select-none">
      <path d="M 14 84 C 14 58 66 58 66 84 Z" fill={p.outfit} stroke="#29160E" strokeWidth="2.5" />
      <circle cx="40" cy="34" r="22" fill={p.hair} />
      <circle cx="40" cy="37" r="18" fill={p.skin} stroke="#29160E" strokeWidth="2.4" />
      <path d="M 22 33 C 23 16 57 16 58 33 C 50 24 30 24 22 33 Z" fill={p.hair} />
      {mood === 'delighted' ? (
        <g stroke="#29160E" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M 30 37 Q 33 33 36 37" />
          <path d="M 44 37 Q 47 33 50 37" />
        </g>
      ) : (
        <g>
          <circle cx="33" cy="37" r="2.6" fill="#29160E" />
          <circle cx="47" cy="37" r="2.6" fill="#29160E" />
          {mood === 'impatient' && (
            <g stroke="#29160E" strokeWidth="2.2" strokeLinecap="round">
              <line x1="29" y1="31" x2="36" y2="33" />
              <line x1="51" y1="31" x2="44" y2="33" />
            </g>
          )}
        </g>
      )}
      {mood === 'impatient' ? (
        <path d="M 34 48 Q 40 43 46 48" fill="none" stroke="#29160E" strokeWidth="2.2" strokeLinecap="round" />
      ) : mood === 'delighted' ? (
        <path d="M 33 44 Q 40 53 47 44 Z" fill="#E11D48" stroke="#29160E" strokeWidth="2" />
      ) : (
        <path d="M 34 45 Q 40 50 46 45" fill="none" stroke="#29160E" strokeWidth="2.2" strokeLinecap="round" />
      )}
      <ellipse cx="28" cy="42" rx="3.2" ry="1.8" fill="#FDA4AF" opacity="0.7" />
      <ellipse cx="52" cy="42" rx="3.2" ry="1.8" fill="#FDA4AF" opacity="0.7" />
    </svg>
  );
};
