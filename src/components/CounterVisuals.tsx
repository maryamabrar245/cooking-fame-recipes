import React from 'react';
import { RecipeId } from '../types/game';

interface CounterVisualsProps {
  recipeId: RecipeId;
  stepIndex: number;
  progress: number; // 0 to 1 for current step
  isStepComplete: boolean;
  pulseKey: number;
}

export const CounterVisuals: React.FC<CounterVisualsProps> = ({
  recipeId,
  stepIndex,
  progress,
  isStepComplete,
  pulseKey,
}) => {
  const effectiveStep = isStepComplete ? stepIndex + 1 : stepIndex;

  return (
    <div
      key={pulseKey}
      className="relative w-full h-56 sm:h-64 flex items-center justify-center select-none"
    >
      <svg
        viewBox="0 0 360 220"
        className="w-full max-w-[360px] h-full drop-shadow-sm"
        aria-label="Kitchen counter preparation stage"
      >
        {/* Warm wooden counter surface */}
        <rect x="20" y="168" width="320" height="28" rx="14" fill="#E6C29F" stroke="#3B231A" strokeWidth="2.5" />
        <ellipse cx="180" cy="172" rx="120" ry="12" fill="#D4A373" opacity="0.45" />

        {recipeId === 'cake' && (
          <g>
            {effectiveStep <= 1 && (
              // Mixing bowl phase (steps 0 & 1)
              <g transform="translate(180, 128)">
                {/* Bowl base */}
                <path
                  d="M -72 -12 C -72 42 72 42 72 -12 Z"
                  fill="#FDE68A"
                  stroke="#3B231A"
                  strokeWidth="2.8"
                />
                <ellipse cx="0" cy="-12" rx="72" ry="16" fill="#FEF3C7" stroke="#3B231A" strokeWidth="2.8" />
                {/* Batter filling */}
                <ellipse
                  cx="0"
                  cy="-9"
                  rx={56}
                  ry={11}
                  fill={stepIndex === 1 ? '#FFF1F2' : '#FDE047'}
                  opacity={Math.max(0.25, progress)}
                />
                {/* Egg/flour pops during step 0 */}
                {stepIndex === 0 && progress > 0.15 && (
                  <g>
                    <circle cx="-22" cy="-12" r="8" fill="#FFFFFF" stroke="#3B231A" strokeWidth="1.8" />
                    <circle cx="-22" cy="-12" r="4" fill="#F59E0B" />
                  </g>
                )}
                {stepIndex === 0 && progress > 0.5 && (
                  <g>
                    <circle cx="18" cy="-10" r="8" fill="#FFFFFF" stroke="#3B231A" strokeWidth="1.8" />
                    <circle cx="18" cy="-10" r="4" fill="#F59E0B" />
                  </g>
                )}
                {/* Whisk swirls during step 1 */}
                {stepIndex === 1 && (
                  <g
                    transform={`translate(${Math.sin(progress * 18) * 18}, -22)`}
                  >
                    <path d="M 0 -32 L 0 4" stroke="#9CA3AF" strokeWidth="3.5" strokeLinecap="round" />
                    <ellipse cx="0" cy="10" rx="11" ry="14" fill="none" stroke="#6B7280" strokeWidth="2.2" />
                    <ellipse cx="0" cy="10" rx="5" ry="14" fill="none" stroke="#6B7280" strokeWidth="1.8" />
                  </g>
                )}
              </g>
            )}

            {effectiveStep >= 2 && (
              // Cake stand phase (steps 2 & 3)
              <g transform="translate(180, 142)">
                {/* Stand */}
                <rect x="-12" y="4" width="24" height="22" fill="#FDA4AF" stroke="#3B231A" strokeWidth="2.4" />
                <ellipse cx="0" cy="26" rx="34" ry="7" fill="#FECDD3" stroke="#3B231A" strokeWidth="2.4" />
                <ellipse cx="0" cy="4" rx="84" ry="12" fill="#FFE4E6" stroke="#3B231A" strokeWidth="2.6" />

                {/* Sponge cake layers */}
                <rect
                  x="-58"
                  y="-46"
                  width="116"
                  height="48"
                  rx="12"
                  fill={stepIndex === 2 && !isStepComplete ? '#FDE68A' : '#F6C28B'}
                  stroke="#3B231A"
                  strokeWidth="2.6"
                />
                {/* Cream middle stripe */}
                {(effectiveStep >= 3 || (stepIndex === 2 && isStepComplete)) && (
                  <path
                    d="M -57 -22 Q -40 -16 -24 -22 Q -8 -28 8 -22 Q 24 -16 40 -22 Q 52 -25 57 -22"
                    fill="none"
                    stroke="#FFF1F2"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                )}

                {/* Frosting swirl layers in step 3 */}
                {(stepIndex === 3 ? progress >= 0.25 : effectiveStep > 3) && (
                  <path
                    d="M -60 -46 Q -45 -32 -30 -44 Q -15 -30 0 -44 Q 15 -30 30 -44 Q 45 -32 60 -46 Q 58 -60 0 -60 Q -58 -60 -60 -46 Z"
                    fill="#FFFDF9"
                    stroke="#3B231A"
                    strokeWidth="2.4"
                  />
                )}
                {(stepIndex === 3 ? progress >= 0.5 : effectiveStep > 3) && (
                  <g fill="#FFF1F2" stroke="#3B231A" strokeWidth="2">
                    <circle cx="-32" cy="-58" r="10" />
                    <circle cx="0" cy="-62" r="12" />
                    <circle cx="32" cy="-58" r="10" />
                  </g>
                )}
                {(stepIndex === 3 ? progress >= 0.9 : effectiveStep > 3) && (
                  <g>
                    {/* Strawberries */}
                    <path d="M -32 -74 C -26 -74 -23 -64 -32 -59 C -41 -64 -38 -74 -32 -74 Z" fill="#E11D48" stroke="#3B231A" strokeWidth="2" />
                    <path d="M 0 -80 C 7 -80 10 -68 0 -62 C -10 -68 -7 -80 0 -80 Z" fill="#E11D48" stroke="#3B231A" strokeWidth="2" />
                    <path d="M 32 -74 C 38 -74 41 -64 32 -59 C 23 -64 26 -74 32 -74 Z" fill="#E11D48" stroke="#3B231A" strokeWidth="2" />
                    <path d="M -4 -81 L 0 -85 L 4 -81" stroke="#16A34A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  </g>
                )}
              </g>
            )}
          </g>
        )}

        {recipeId === 'sandwich' && (
          <g transform="translate(180, 146)">
            {stepIndex === 0 && !isStepComplete ? (
              // Cutting board slicing veggies
              <g>
                <rect x="-90" y="-6" width="180" height="24" rx="10" fill="#FDE68A" stroke="#3B231A" strokeWidth="2.4" />
                <circle cx="-42" cy="-12" r="15" fill="#EF4444" stroke="#3B231A" strokeWidth="2.2" />
                {progress > 0.25 && <ellipse cx="-10" cy="-6" rx="13" ry="6" fill="#EF4444" stroke="#3B231A" strokeWidth="2" />}
                {progress > 0.5 && <ellipse cx="22" cy="-6" rx="13" ry="6" fill="#84CC16" stroke="#3B231A" strokeWidth="2" />}
                {progress > 0.75 && <ellipse cx="52" cy="-6" rx="13" ry="6" fill="#84CC16" stroke="#3B231A" strokeWidth="2" />}
              </g>
            ) : (
              // Plate & sandwich building
              <g>
                <ellipse cx="0" cy="14" rx="96" ry="14" fill="#FFFFFF" stroke="#3B231A" strokeWidth="2.5" />
                {/* Bottom toasted brioche */}
                <rect
                  x="-58"
                  y="-6"
                  width="116"
                  height="18"
                  rx="6"
                  fill={effectiveStep >= 2 || (stepIndex === 1 && progress > 0.5) ? '#D97706' : '#FDE68A'}
                  stroke="#3B231A"
                  strokeWidth="2.4"
                />
                {/* Lettuce layer */}
                {(effectiveStep > 2 || (stepIndex === 2 && progress >= 0.25)) && (
                  <path
                    d="M -62 -10 Q -46 -18 -30 -10 Q -14 -18 0 -10 Q 16 -18 32 -10 Q 48 -18 62 -10 L 58 -4 L -58 -4 Z"
                    fill="#22C55E"
                    stroke="#3B231A"
                    strokeWidth="2"
                  />
                )}
                {/* Cheddar slice */}
                {(effectiveStep > 2 || (stepIndex === 2 && progress >= 0.5)) && (
                  <path
                    d="M -60 -16 L 60 -16 L 54 -8 L 12 -4 L -18 -10 L -56 -8 Z"
                    fill="#FACC15"
                    stroke="#3B231A"
                    strokeWidth="2.2"
                  />
                )}
                {/* Tomato & Avocado */}
                {(effectiveStep > 2 || (stepIndex === 2 && progress >= 0.75)) && (
                  <g>
                    <rect x="-50" y="-26" width="44" height="10" rx="4" fill="#EF4444" stroke="#3B231A" strokeWidth="2" />
                    <rect x="4" y="-26" width="46" height="10" rx="4" fill="#84CC16" stroke="#3B231A" strokeWidth="2" />
                  </g>
                )}
                {/* Top brioche */}
                {(effectiveStep > 2 || (stepIndex === 2 && progress >= 0.95)) && (
                  <rect
                    x="-58"
                    y="-46"
                    width="116"
                    height="20"
                    rx="8"
                    fill="#D97706"
                    stroke="#3B231A"
                    strokeWidth="2.4"
                  />
                )}
                {/* Warm melty sheen on step 3 */}
                {stepIndex === 3 && progress > 0.3 && (
                  <path
                    d="M -32 -54 Q -24 -64 -16 -54 M 12 -54 Q 20 -64 28 -54"
                    stroke="#F97316"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    opacity={progress}
                  />
                )}
              </g>
            )}
          </g>
        )}

        {recipeId === 'juice' && (
          <g transform="translate(180, 146)">
            {effectiveStep <= 1 ? (
              // Juicer / Blender stage
              <g>
                {/* Blender base */}
                <rect x="-42" y="-12" width="84" height="32" rx="10" fill="#FDA4AF" stroke="#3B231A" strokeWidth="2.5" />
                <circle cx="0" cy="4" r="7" fill="#FFFFFF" stroke="#3B231A" strokeWidth="2" />
                {/* Pitcher */}
                <path
                  d="M -38 -12 L -48 -98 L 48 -98 L 38 -12 Z"
                  fill="rgba(255,255,255,0.75)"
                  stroke="#3B231A"
                  strokeWidth="2.5"
                />
                {/* Blended liquid */}
                <path
                  d={`M -37 -14 L -${38 + progress * 8} -${22 + progress * 56} L ${38 + progress * 8} -${22 + progress * 56} L 37 -14 Z`}
                  fill={stepIndex === 1 ? '#FB7185' : '#FB923C'}
                  opacity="0.9"
                />
                {/* Lid */}
                <rect x="-50" y="-108" width="100" height="12" rx="6" fill="#3B231A" />
              </g>
            ) : (
              // Tall glass & garnish stage
              <g>
                {/* Coaster */}
                <ellipse cx="0" cy="20" rx="54" ry="8" fill="#D97706" stroke="#3B231A" strokeWidth="2.2" />
                {/* Glass */}
                <path
                  d="M -34 16 L -42 -84 L 42 -84 L 34 16 Z"
                  fill="rgba(255,255,255,0.75)"
                  stroke="#3B231A"
                  strokeWidth="2.6"
                />
                {/* Sunset layered juice */}
                {(stepIndex === 2 ? progress > 0.1 : true) && (
                  <g>
                    <path
                      d="M -32 14 L -37 -32 L 37 -32 L 32 14 Z"
                      fill="#F59E0B"
                      opacity={stepIndex === 2 ? Math.min(1, progress * 1.4) : 1}
                    />
                    <path
                      d="M -37 -32 L -40 -70 L 40 -70 L 37 -32 Z"
                      fill="#FB7185"
                      opacity={stepIndex === 2 ? Math.max(0, (progress - 0.35) * 1.6) : 0.95}
                    />
                  </g>
                )}
                {/* Garnishes in step 3 */}
                {(stepIndex === 3 ? progress >= 0.33 : effectiveStep > 3) && (
                  <g fill="rgba(255,255,255,0.75)" stroke="#3B231A" strokeWidth="1.6">
                    <rect x="-20" y="-64" width="16" height="16" rx="3" transform="rotate(-12 -12 -56)" />
                    <rect x="4" y="-58" width="16" height="16" rx="3" transform="rotate(14 12 -50)" />
                  </g>
                )}
                {(stepIndex === 3 ? progress >= 0.66 : effectiveStep > 3) && (
                  <g>
                    <circle cx="-40" cy="-84" r="18" fill="#FB923C" stroke="#3B231A" strokeWidth="2.2" />
                    <circle cx="-40" cy="-84" r="13" fill="#FDE68A" />
                  </g>
                )}
                {(stepIndex === 3 ? progress >= 0.95 : effectiveStep > 3) && (
                  <path
                    d="M 10 -40 L 22 -114 L 42 -118"
                    fill="none"
                    stroke="#E11D48"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </g>
            )}
          </g>
        )}

        {recipeId === 'dates' && (
          <g transform="translate(180, 148)">
            {/* Pretty ceramic plate */}
            <ellipse cx="0" cy="12" rx="112" ry="18" fill="#FFF1F2" stroke="#3B231A" strokeWidth="2.5" />
            <ellipse cx="0" cy="12" rx="92" ry="12" fill="#FFE4E6" />

            {stepIndex === 2 && !isStepComplete ? (
              // Chocolate saucepan melting step
              <g transform="translate(0, -16)">
                <rect x="42" y="-12" width="54" height="9" rx="4" fill="#3B231A" />
                <path d="M -52 -16 L 52 -16 L 44 20 L -44 20 Z" fill="#9CA3AF" stroke="#3B231A" strokeWidth="2.5" />
                <ellipse cx="0" cy="-16" rx="52" ry="10" fill="#451A03" stroke="#3B231A" strokeWidth="2.5" />
                <ellipse cx="0" cy="-16" rx={38 * Math.max(0.4, progress)} ry={6} fill="#78350F" />
              </g>
            ) : (
              // 4 plump Medjool dates arranged on plate
              <g>
                {[
                  { x: -48, y: -2 },
                  { x: 42, y: -4 },
                  { x: -16, y: 8 },
                  { x: 18, y: -14 },
                ].map((pos, idx) => {
                  const showSlit =
                    stepIndex > 0 || isStepComplete || progress >= (idx + 1) * 0.24;
                  const showAlmonds =
                    effectiveStep > 1 || (stepIndex === 1 && progress >= 0.25);
                  const showPeanuts =
                    effectiveStep > 1 || (stepIndex === 1 && progress >= 0.55);
                  const showDrizzle =
                    effectiveStep > 3 || (stepIndex === 3 && (isStepComplete || progress > 0.35));

                  return (
                    <g key={idx} transform={`translate(${pos.x}, ${pos.y})`}>
                      {/* Date body */}
                      <ellipse cx="0" cy="0" rx="26" ry="14" fill="#6D2E1A" stroke="#3B231A" strokeWidth="2.2" />
                      {/* Opened pocket */}
                      {showSlit && (
                        <ellipse cx="0" cy="-2" rx="18" ry="6" fill="#B45309" stroke="#3B231A" strokeWidth="1.5" />
                      )}
                      {/* Roasted Almond inside */}
                      {showAlmonds && (
                        <ellipse
                          cx="-5"
                          cy="-4"
                          rx="8"
                          ry="4.5"
                          transform="rotate(-12 -5 -4)"
                          fill="#D97706"
                          stroke="#3B231A"
                          strokeWidth="1.6"
                        />
                      )}
                      {/* Crunchy Peanuts inside */}
                      {showPeanuts && (
                        <g fill="#FDE68A" stroke="#3B231A" strokeWidth="1.4">
                          <circle cx="6" cy="-4" r="4" />
                          <circle cx="11" cy="-2" r="3.5" />
                        </g>
                      )}
                      {/* Glossy Chocolate Drizzle & Sea Salt */}
                      {showDrizzle && (
                        <g>
                          <path
                            d="M -18 -6 Q -10 8 -2 -6 Q 6 9 14 -6 Q 18 2 20 -2"
                            fill="none"
                            stroke="#3B180B"
                            strokeWidth="4.2"
                            strokeLinecap="round"
                          />
                          <circle cx="-4" cy="-5" r="1.4" fill="#FFFFFF" />
                          <circle cx="7" cy="-4" r="1.4" fill="#FFFFFF" />
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
