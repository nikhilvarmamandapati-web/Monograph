import React from 'react';
import { PenSquare } from 'lucide-react';

interface HeaderProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenPublish: () => void;
  onOpenDatabase: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenPublish,
  onOpenDatabase,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <button
          onClick={onGoHome}
          className="text-2xl font-serif font-semibold tracking-tight text-stone-900 hover:text-amber-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Monograph
        </button>

        {/* Zone 2: 4–5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => onSelectCategory('All')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentCategory === 'All' ? 'text-stone-950 font-semibold underline underline-offset-8 decoration-stone-400' : ''
            }`}
          >
            All Works
          </button>
          <button
            onClick={() => onSelectCategory('Architecture')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentCategory === 'Architecture' ? 'text-stone-950 font-semibold underline underline-offset-8 decoration-stone-400' : ''
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => onSelectCategory('Typography')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentCategory === 'Typography' ? 'text-stone-950 font-semibold underline underline-offset-8 decoration-stone-400' : ''
            }`}
          >
            Typography
          </button>
          <button
            onClick={() => onSelectCategory('Essays')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentCategory === 'Essays' ? 'text-stone-950 font-semibold underline underline-offset-8 decoration-stone-400' : ''
            }`}
          >
            Essays
          </button>
          <button
            onClick={onOpenDatabase}
            className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            MongoDB
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenPublish}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-stone-100 bg-stone-900 rounded-lg hover:bg-stone-800 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span>Write Story</span>
          </button>
        </div>
      </div>
    </header>
  );
};
