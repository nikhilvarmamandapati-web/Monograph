import React from 'react';
import { Database, PenSquare } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (category: string) => void;
  onOpenPublish: () => void;
  onOpenDatabase: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenPublish,
  onOpenDatabase,
}) => {
  return (
    <footer className="border-t border-stone-200 bg-[#F7F4EE] py-12 text-stone-600">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-stone-200">
          {/* Brand & Curatorial Statement */}
          <div className="md:col-span-5 space-y-3">
            <span className="text-xl font-serif font-semibold text-stone-900 block">
              Monograph
            </span>
            <p className="text-xs text-stone-500 font-sans leading-relaxed max-w-sm">
              An independent publishing platform for architectural theory, typographic history, and long-form cultural monographs. Powered by React, Node.js, and MongoDB.
            </p>
          </div>

          {/* Catalog Categories */}
          <div className="md:col-span-4 space-y-2 text-xs font-sans">
            <span className="font-mono uppercase tracking-widest text-stone-400 block mb-2">
              Archives &amp; Curations
            </span>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onSelectCategory('Architecture')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Architecture &amp; Spatial Studies
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Typography')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Typography &amp; Press History
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Essays')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Critical Essays &amp; Commentary
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Design Philosophy')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Design Philosophy &amp; Ethics
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <span className="font-mono uppercase tracking-widest text-stone-400 block mb-2">
              Platform Controls
            </span>
            <div className="space-y-2">
              <button
                onClick={onOpenPublish}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 transition-colors cursor-pointer"
              >
                <span>Publish New Monograph</span>
                <PenSquare className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onOpenDatabase}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 transition-colors cursor-pointer"
              >
                <span>MongoDB Architecture</span>
                <Database className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quiet Bottom Legal */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-stone-400">
          <span>&copy; {new Date().getFullYear()} Monograph Journal. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <span>React 19</span>
            <span aria-hidden="true">·</span>
            <span>Node.js / Express</span>
            <span aria-hidden="true">·</span>
            <span>MongoDB Database</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
