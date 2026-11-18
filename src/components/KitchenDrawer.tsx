import React, { useState } from 'react';
import { AlertCircle, Check, ChevronDown, UtensilsCrossed, X } from 'lucide-react';
import { KITCHEN_TOOLS } from '../data/recipes';
import { ChefMood, KitchenTool, Recipe } from '../types/game';
import { soundFX } from '../utils/sound';
import { ChefCoco } from './ChefCoco';

interface KitchenDrawerProps {
  recipe: Recipe;
  onToolPicked: (tool: KitchenTool, mistakes: number) => void;
}

export const KitchenDrawer: React.FC<KitchenDrawerProps> = ({
  recipe,
  onToolPicked,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejectedToolIds, setRejectedToolIds] = useState<string[]>([]);
  const [shakenToolId, setShakenToolId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [pickedTool, setPickedTool] = useState<KitchenTool | null>(null);
  const [cocoMood, setCocoMood] = useState<ChefMood>('idle');
  const [cocoLine, setCocoLine] = useState(recipe.toolPrompt);

  const handleToggleDrawer = () => {
    soundFX.playPop(isOpen ? 400 : 560);
    setIsOpen((prev) => !prev);
  };

  const handleSelectTool = (tool: KitchenTool) => {
    if (pickedTool || rejectedToolIds.includes(tool.id)) return;

    if (tool.id === recipe.requiredToolId) {
      soundFX.playGoodPick();
      setPickedTool(tool);
      setErrorMsg(null);
      setCocoMood('excited');
      setCocoLine(`Yes! The ${tool.name} is ideal for ${recipe.title}. Putting it on the counter!`);
      setTimeout(() => {
        onToolPicked(tool, mistakes);
      }, 650);
    } else {
      soundFX.playOops();
      setMistakes((m) => m + 1);
      setRejectedToolIds((prev) => [...prev, tool.id]);
      setShakenToolId(tool.id);
      const reason = `Cookware Error: "${tool.name}" will not work for ${recipe.title}. Pick the right pan or appliance from the drawer!`;
      setErrorMsg(reason);
      setCocoMood('oops');
      setCocoLine(`Oops! We cannot make ${recipe.shortTitle.toLowerCase()} with a ${tool.name}.`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5 sm:py-8 animate-pop-in">
      <div className="kitchen-panel rounded-3xl p-5 sm:p-8 flex flex-col gap-6">
        {/* Header + Coco */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <p className="text-xs font-bold tracking-wide text-rose-600 mb-1">
              Phase 2 · Cookware Drawer
            </p>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#2D221E]">
              Pull open the drawer &amp; pick your pan
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-xl">
              Every great dish starts with the right cookware. Open the wooden kitchen drawer below and select what fits <span className="font-semibold text-[#2D221E]">{recipe.title}</span>.
            </p>
          </div>

          <ChefCoco mood={cocoMood} dialogue={cocoLine} size="sm" />
        </div>

        {/* Interactive Wooden Kitchen Drawer */}
        <div className="rounded-3xl border-2 border-[#A67449] bg-[#F5E1C8] p-4 sm:p-5 shadow-inner">
          {/* Drawer Front / Handle Bar */}
          <button
            type="button"
            onClick={handleToggleDrawer}
            className="kitchen-wood-shelf w-full min-h-[60px] rounded-2xl px-5 py-3 flex items-center justify-between gap-4 text-[#3B231A] cursor-pointer transition-transform active:translate-y-0.5"
          >
            <span className="flex items-center gap-2.5 font-display font-bold text-base sm:text-lg">
              <UtensilsCrossed className="w-5 h-5 text-[#7C5230]" />
              <span>{isOpen ? 'Kitchen Pan & Tool Drawer (Open)' : 'Tap Handle to Open Kitchen Drawer'}</span>
            </span>

            {/* Brass Drawer Handle Visual + Chevron */}
            <span className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline-block w-16 h-2.5 rounded-full bg-gradient-to-b from-amber-300 to-amber-600 border border-[#78350F] shadow-xs" />
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </span>
          </button>

          {/* Drawer Interior Compartments */}
          {isOpen && (
            <div className="mt-5 animate-drawer-slide">
              {errorMsg && (
                <div
                  role="alert"
                  className="mb-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="font-medium leading-snug">{errorMsg}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {KITCHEN_TOOLS.map((tool) => {
                  const isPicked = pickedTool?.id === tool.id;
                  const isRejected = rejectedToolIds.includes(tool.id);
                  const isShaking = shakenToolId === tool.id;

                  return (
                    <button
                      key={tool.id}
                      type="button"
                      disabled={Boolean(pickedTool) || isRejected}
                      onClick={() => handleSelectTool(tool)}
                      className={`relative rounded-2xl border-2 p-4 text-left flex items-center gap-3.5 transition-all duration-150 min-h-[88px] focus-visible:outline-2 focus-visible:outline-rose-600 ${
                        isShaking && isRejected ? 'animate-shake-error' : ''
                      } ${
                        isPicked
                          ? 'bg-emerald-50 border-emerald-500 shadow-md scale-[1.02]'
                          : isRejected
                            ? 'bg-red-50/90 border-red-300 opacity-75 cursor-not-allowed'
                            : 'bg-[#FFFDF9] border-[#D8B998] hover:border-rose-500 hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-pointer'
                      }`}
                    >
                      <span
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border border-black/5 ${
                          isRejected ? 'grayscale opacity-60' : ''
                        }`}
                        style={{ backgroundColor: tool.accentColor }}
                      >
                        {tool.emoji}
                      </span>

                      <div className="min-w-0 flex-1 pr-5">
                        <p
                          className={`font-display font-bold text-base leading-tight ${
                            isRejected ? 'line-through text-red-800' : 'text-[#2D221E]'
                          }`}
                        >
                          {tool.name}
                        </p>
                        <p className="text-xs text-stone-600 mt-1 leading-snug">
                          {tool.subtitle}
                        </p>
                      </div>

                      {isPicked && (
                        <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}

                      {isRejected && (
                        <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
