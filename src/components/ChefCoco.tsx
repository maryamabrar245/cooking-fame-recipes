import React, { useEffect, useState } from 'react';
import { ChefMood } from '../types/game';

interface ChefCocoProps {
  mood: ChefMood;
  dialogue: string;
  size?: 'sm' | 'md' | 'lg';
  isActionActive?: boolean;
  bubblePosition?: 'top' | 'right';
}

export const ChefCoco: React.FC<ChefCocoProps> = ({
  mood,
  dialogue,
  size = 'md',
  isActionActive = false,
  bubblePosition = 'right',
}) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      const t = setTimeout(() => setIsBlinking(false), 140);
      return () => clearTimeout(t);
    }, 3600);
    return () => clearInterval(interval);
  }, []);

  const sizeClasses =
    size === 'lg'
      ? 'w-44 h-48 sm:w-56 sm:h-60'
      : size === 'sm'
        ? 'w-24 h-28 sm:w-28 sm:h-32'
        : 'w-32 h-36 sm:w-40 sm:h-44';

  const wrapperAnimation =
    mood === 'excited' || mood === 'proud'
      ? 'animate-coco-cheer'
      : mood === 'oops'
        ? 'animate-wiggle'
        : 'animate-coco-bob';

  const renderEyes = () => {
    if (mood === 'happy' || mood === 'proud') {
      // Joyful curved happy eyes
      return (
        <g stroke="#3B231A" strokeWidth="3.2" strokeLinecap="round" fill="none">
          <path d="M 73 95 Q 80 87 87 95" />
          <path d="M 113 95 Q 120 87 127 95" />
        </g>
      );
    }

    if (mood === 'excited') {
      // One playful wink + bright sparkly eye
      return (
        <g>
          <path
            d="M 72 95 Q 80 87 88 95"
            stroke="#3B231A"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="120" cy="94" rx="6.5" ry={isBlinking ? 1.2 : 7.5} fill="#3B231A" />
          {!isBlinking && <circle cx="118" cy="91" r="2.2" fill="#FFFFFF" />}
        </g>
      );
    }

    if (mood === 'oops') {
      // Comical surprised > < or wide eyes
      return (
        <g>
          <circle cx="80" cy="94" r="7.5" fill="#FFFFFF" stroke="#3B231A" strokeWidth="2.5" />
          <circle cx="80" cy="94" r="3" fill="#3B231A" />
          <circle cx="120" cy="94" r="7.5" fill="#FFFFFF" stroke="#3B231A" strokeWidth="2.5" />
          <circle cx="120" cy="94" r="3" fill="#3B231A" />
          {/* Sweat drop */}
          <path
            d="M 145 78 C 145 78 151 86 151 90 A 6 6 0 1 1 139 90 C 139 86 145 78 145 78 Z"
            fill="#93C5FD"
            stroke="#3B231A"
            strokeWidth="1.8"
          />
        </g>
      );
    }

    // Default idle / cooking eyes with natural blink
    return (
      <g>
        <ellipse cx="80" cy="94" rx="6" ry={isBlinking ? 1.2 : 7.2} fill="#3B231A" />
        <ellipse cx="120" cy="94" rx="6" ry={isBlinking ? 1.2 : 7.2} fill="#3B231A" />
        {!isBlinking && (
          <>
            <circle cx="78" cy="91" r="2.2" fill="#FFFFFF" />
            <circle cx="118" cy="91" r="2.2" fill="#FFFFFF" />
          </>
        )}
      </g>
    );
  };

  const renderMouth = () => {
    if (mood === 'excited' || mood === 'proud') {
      return (
        <path
          d="M 90 110 Q 100 124 110 110 Z"
          fill="#E11D48"
          stroke="#3B231A"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      );
    }
    if (mood === 'oops') {
      return (
        <ellipse
          cx="100"
          cy="114"
          rx="5.5"
          ry="6.5"
          fill="#F43F5E"
          stroke="#3B231A"
          strokeWidth="2.4"
        />
      );
    }
    if (mood === 'cooking') {
      return (
        <path
          d="M 93 112 Q 100 117 107 111"
          fill="none"
          stroke="#3B231A"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      );
    }
    return (
      <path
        d="M 90 110 Q 100 119 110 110"
        fill="none"
        stroke="#3B231A"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    );
  };

  const renderBrows = () => {
    if (mood === 'oops') {
      return (
        <g stroke="#3B231A" strokeWidth="2.4" strokeLinecap="round" fill="none">
          <path d="M 72 82 Q 80 78 87 83" />
          <path d="M 113 83 Q 120 78 128 82" />
        </g>
      );
    }
    return (
      <g stroke="#3B231A" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M 73 83 Q 80 80 86 83" />
        <path d="M 114 83 Q 120 80 127 83" />
      </g>
    );
  };

  const bubbleTone =
    mood === 'oops'
      ? 'bg-amber-50 border-amber-300 text-amber-950'
      : mood === 'excited' || mood === 'proud'
        ? 'bg-rose-50 border-rose-200 text-stone-900'
        : 'bg-white border-stone-200 text-stone-800';

  return (
    <div
      className={`flex ${
        bubblePosition === 'top'
          ? 'flex-col-reverse items-center gap-3'
          : 'flex-col sm:flex-row items-center gap-3 sm:gap-4'
      }`}
    >
      {/* Animated Character Illustration */}
      <div className={`relative shrink-0 ${sizeClasses} ${wrapperAnimation} select-none`}>
        <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-sm" aria-label="Chef Coco">
          {/* Soft floor shadow */}
          <ellipse cx="100" cy="210" rx="52" ry="7" fill="rgba(45,34,30,0.08)" />

          {/* Back hair & space buns */}
          <circle cx="52" cy="54" r="21" fill="#3B231A" />
          <circle cx="148" cy="54" r="21" fill="#3B231A" />
          {/* Cute pastel hair scrunchies */}
          <ellipse cx="62" cy="64" rx="8" ry="5" transform="rotate(-35 62 64)" fill="#FB7185" />
          <ellipse cx="138" cy="64" rx="8" ry="5" transform="rotate(35 138 64)" fill="#FB7185" />

          {/* Back hair silhouette */}
          <path
            d="M 48 92 C 48 54 152 54 152 92 L 154 128 C 138 134 62 134 46 128 Z"
            fill="#3B231A"
          />

          {/* Shoulders & Cozy striped shirt */}
          <path
            d="M 54 198 C 54 154 72 142 100 142 C 128 142 146 154 146 198 Z"
            fill="#FFF7ED"
            stroke="#3B231A"
            strokeWidth="2.8"
          />
          {/* Stripes on sleeves */}
          <path d="M 60 168 Q 70 166 76 168" stroke="#FDBA74" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 124 168 Q 130 166 140 168" stroke="#FDBA74" strokeWidth="3.5" strokeLinecap="round" />

          {/* Sage Gingham Chef Apron */}
          <path
            d="M 70 152 L 130 152 L 138 202 L 62 202 Z"
            fill="#84CC9E"
            stroke="#3B231A"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* Apron straps */}
          <path d="M 74 144 L 78 154" stroke="#3B231A" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 126 144 L 122 154" stroke="#3B231A" strokeWidth="2.8" strokeLinecap="round" />
          {/* Apron front pocket with heart */}
          <path
            d="M 83 172 L 117 172 L 117 190 Q 117 195 112 195 L 88 195 Q 83 195 83 190 Z"
            fill="#ECFDF5"
            stroke="#3B231A"
            strokeWidth="2.2"
          />
          <path
            d="M 100 187 C 100 187 93 182 93 178 A 3.5 3.5 0 0 1 100 177 A 3.5 3.5 0 0 1 107 178 C 107 182 100 187 100 187 Z"
            fill="#FB7185"
          />

          {/* Neck */}
          <rect x="91" y="128" width="18" height="20" rx="8" fill="#FCD5B5" stroke="#3B231A" strokeWidth="2.5" />

          {/* Arms — animated based on mood/action */}
          {mood === 'excited' || mood === 'proud' ? (
            <>
              <path
                d="M 60 162 Q 36 142 42 118"
                fill="none"
                stroke="#FCD5B5"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 60 162 Q 36 142 42 118"
                fill="none"
                stroke="#3B231A"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <circle cx="42" cy="116" r="7" fill="#FCD5B5" stroke="#3B231A" strokeWidth="2.4" />

              <path
                d="M 140 162 Q 164 142 158 118"
                fill="none"
                stroke="#FCD5B5"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 140 162 Q 164 142 158 118"
                fill="none"
                stroke="#3B231A"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <circle cx="158" cy="116" r="7" fill="#FCD5B5" stroke="#3B231A" strokeWidth="2.4" />
            </>
          ) : (
            <>
              <path
                d={isActionActive ? 'M 60 162 Q 44 172 52 184' : 'M 60 162 Q 48 176 58 188'}
                fill="none"
                stroke="#FCD5B5"
                strokeWidth="11"
                strokeLinecap="round"
              />
              <circle
                cx={isActionActive ? 53 : 59}
                cy={isActionActive ? 185 : 189}
                r="6.5"
                fill="#FCD5B5"
                stroke="#3B231A"
                strokeWidth="2.4"
              />
              {/* Right arm holding wooden spoon when cooking */}
              <path
                d={isActionActive ? 'M 140 162 Q 160 166 154 182' : 'M 140 162 Q 154 176 144 188'}
                fill="none"
                stroke="#FCD5B5"
                strokeWidth="11"
                strokeLinecap="round"
              />
              {mood === 'cooking' && (
                <g transform={isActionActive ? 'translate(148, 154) rotate(18)' : 'translate(140, 160) rotate(5)'}>
                  <rect x="3" y="14" width="5" height="32" rx="2.5" fill="#D97706" stroke="#3B231A" strokeWidth="1.8" />
                  <ellipse cx="5.5" cy="11" rx="7" ry="10" fill="#F59E0B" stroke="#3B231A" strokeWidth="1.8" />
                </g>
              )}
              <circle
                cx={isActionActive ? 153 : 143}
                cy={isActionActive ? 183 : 189}
                r="6.5"
                fill="#FCD5B5"
                stroke="#3B231A"
                strokeWidth="2.4"
              />
            </>
          )}

          {/* Ears */}
          <circle cx="52" cy="98" r="7.5" fill="#FCD5B5" stroke="#3B231A" strokeWidth="2.4" />
          <circle cx="148" cy="98" r="7.5" fill="#FCD5B5" stroke="#3B231A" strokeWidth="2.4" />

          {/* Face */}
          <rect
            x="54"
            y="50"
            width="92"
            height="86"
            rx="44"
            fill="#FCD5B5"
            stroke="#3B231A"
            strokeWidth="2.8"
          />

          {/* Cute Front Bangs */}
          <path
            d="M 53 84 C 54 52 78 42 100 42 C 122 42 146 52 147 84 C 136 68 124 66 112 75 C 102 64 90 66 80 76 C 70 67 60 71 53 84 Z"
            fill="#3B231A"
          />

          {/* Cozy Chef Headband + Mini Bow */}
          <path
            d="M 55 72 Q 100 52 145 72"
            fill="none"
            stroke="#FB7185"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle cx="131" cy="60" r="6" fill="#F43F5E" stroke="#3B231A" strokeWidth="2" />

          {/* Rosy Cheeks */}
          <ellipse cx="70" cy="106" rx="7.5" ry="4.5" fill="#FDA4AF" opacity="0.7" />
          <ellipse cx="130" cy="106" rx="7.5" ry="4.5" fill="#FDA4AF" opacity="0.7" />

          {renderBrows()}
          {renderEyes()}
          {renderMouth()}

          {/* Excited/Proud sparkle accents */}
          {(mood === 'excited' || mood === 'proud') && (
            <g fill="#FBBF24" stroke="#3B231A" strokeWidth="1.5">
              <path d="M 32 54 L 35 62 L 43 65 L 35 68 L 32 76 L 29 68 L 21 65 L 29 62 Z" />
              <path d="M 168 48 L 170 54 L 176 56 L 170 58 L 168 64 L 166 58 L 160 56 L 166 54 Z" />
            </g>
          )}
        </svg>
      </div>

      {/* Speech Bubble */}
      {dialogue && (
        <div
          key={dialogue}
          className={`animate-pop-in relative max-w-xs sm:max-w-sm rounded-2xl border px-4 py-3 text-sm sm:text-[15px] leading-snug font-medium shadow-sm ${bubbleTone}`}
        >
          <span className="block text-[11px] font-bold tracking-wide text-rose-600 mb-0.5">
            Chef Coco
          </span>
          <p>{dialogue}</p>
        </div>
      )}
    </div>
  );
};
