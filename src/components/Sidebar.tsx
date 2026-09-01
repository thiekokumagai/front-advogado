import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { assistantsService } from '../services/assistants.service';
import { conversationsService } from '../services/conversations.service';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DynamicIcon } from './DynamicIcon';
import { Assistant } from '../types';
import { Link } from 'react-router-dom';
import {
  Plus,
  MessageSquare,
  Scale,
  Sun,
  Moon,
  LogOut,
  ShieldAlert,
  ChevronRight,
  Trash2,
  Building2,
  FileCode,
} from 'lucide-react';

interface SidebarProps {
  activeConversationId: string | null;
  onSelectAssistant: (assistant: Assistant) => void;
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
  onOpenAdmin: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeConversationId,
  onSelectAssistant,
  onSelectConversation,
  onNewChat,
  onOpenAdmin,
}) => {
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch Assistants
  const { data: assistants = [], isLoading: loadingAssistants } = useQuery({
    queryKey: ['assistants'],
    queryFn: assistantsService.getAll,
  });

  // Fetch Conversations History in Real-Time (refetchEvery 3s like LojaPod)
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: conversationsService.getAll,
    refetchInterval: 3000,
  });

  const categories = Array.from(new Set(assistants.map((a) => a.category)));

  const filteredAssistants =
    selectedCategory === 'all'
      ? assistants
      : assistants.filter((a) => a.category === selectedCategory);

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Deseja excluir este histórico de conversa?')) {
      await conversationsService.delete(id);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  };

  return (
    <aside className="w-80 h-screen flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 select-none shrink-0 transition-colors duration-200">
      {/* Header / Brand */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-white/60 dark:bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-wide flex items-center gap-1.5">
              Portal IA <span className="text-amber-600 dark:text-amber-400 font-normal text-xs bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">Advogados</span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
              {user?.office.name || 'Escritório Demo'}
            </p>
          </div>
        </div>
      </div>

      {/* New Chat & Contract Templates Buttons */}
      <div className="p-3 space-y-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-sm transition-all duration-200 shadow-md shadow-amber-500/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Nova Consulta / Peça
        </button>

        <Link
          to="/templates"
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-200/70 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition border border-slate-300/60 dark:border-slate-700/60"
        >
          <FileCode className="w-4 h-4 text-amber-500" />
          Modelos de Contratos
        </Link>
      </div>

      {/* Dynamic Assistants Menu */}
      <div className="px-3 py-2 flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Assistentes Jurídicos
          </span>
          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full">
            {filteredAssistants.length} disponíveis
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                : 'bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                  : 'bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dynamic Assistants List from DB (Zero IF logic) */}
        <div className="space-y-1 overflow-y-auto max-h-56 pr-1 custom-scrollbar">
          {loadingAssistants ? (
            <div className="text-center py-4 text-slate-500 text-xs animate-pulse">Carregando assistentes do banco...</div>
          ) : (
            filteredAssistants.map((ast) => (
              <button
                key={ast.id}
                onClick={() => onSelectAssistant(ast)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/80 text-left transition group border border-transparent hover:border-slate-300 dark:hover:border-slate-700/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 group-hover:scale-105 transition">
                    <DynamicIcon name={ast.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-300 transition">
                      {ast.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{ast.category}</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-amber-500 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Chat History Section */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col flex-1 min-h-0">
          <div className="px-2 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Histórico do Escritório
            </span>
            <span className="text-[10px] text-slate-500">{conversations.length} conversas</span>
          </div>

          <div className="space-y-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {conversations.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                Nenhum histórico salvo. Inicie uma nova consulta acima.
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConversationId === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl text-left text-xs cursor-pointer transition border ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{conv.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {conv.assistant?.name} • {new Date(conv.updatedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 dark:hover:text-red-400 transition"
                      title="Excluir histórico"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer / User Controls */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/40 space-y-2">
        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <button
            onClick={onOpenAdmin}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-semibold transition"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Painel Admin & Prompts
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-amber-600 dark:text-amber-400 shrink-0">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title="Alternar Modo Escuro / Claro"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title="Sair do Sistema"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
