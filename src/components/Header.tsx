import React from 'react';
import { Assistant } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { Sparkles, Plus, Scale } from 'lucide-react';

interface HeaderProps {
  currentAssistant: Assistant | null;
  onNewChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentAssistant, onNewChat }) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none transition-colors duration-200">
      <div className="flex items-center gap-3">
        {currentAssistant ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-sm shadow-amber-500/10">
              <DynamicIcon name={currentAssistant.icon} className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{currentAssistant.name}</h2>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                  {currentAssistant.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-lg truncate">
                {currentAssistant.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Portal IA para Advogados</h2>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          GPT-4o Ativo
        </div>

        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs transition border border-slate-300 dark:border-slate-700"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Sessão
        </button>
      </div>
    </header>
  );
};
