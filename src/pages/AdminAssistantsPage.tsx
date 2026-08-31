import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assistantsService, CreateAssistantPayload } from '../services/assistants.service';
import { Assistant } from '../types';
import { DynamicIcon } from '../components/DynamicIcon';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Sparkles,
  ArrowLeft,
  FileCode,
  Sliders,
  Eye,
  Bot,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AVAILABLE_ICONS = [
  'FileText',
  'ShieldCheck',
  'Gavel',
  'BookOpen',
  'FileCheck',
  'Scale',
  'Sparkles',
  'Briefcase',
  'Search',
  'Building2',
  'Scroll',
  'CheckSquare',
  'Feather',
  'Award',
];

export const AdminAssistantsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('FileText');
  const [category, setCategory] = useState('Petições');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Fetch Assistants
  const { data: assistants = [], isLoading } = useQuery({
    queryKey: ['assistants'],
    queryFn: assistantsService.getAll,
  });

  const openCreateModal = () => {
    setEditingAssistant(null);
    setName('');
    setIcon('FileText');
    setCategory('Petições');
    setDescription('');
    setSystemPrompt(
      `Você é um advogado especialista em Direito Brasileiro.\nSua função é...`,
    );
    setOrder(assistants.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (ast: Assistant) => {
    setEditingAssistant(ast);
    setName(ast.name);
    setIcon(ast.icon);
    setCategory(ast.category);
    setDescription(ast.description);
    setSystemPrompt(ast.systemPrompt);
    setOrder(ast.order);
    setIsActive(ast.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateAssistantPayload = {
      name,
      icon,
      category,
      description,
      systemPrompt,
      order: Number(order),
      isActive,
    };

    if (editingAssistant) {
      await assistantsService.update(editingAssistant.id, payload);
    } else {
      await assistantsService.create(payload);
    }

    queryClient.invalidateQueries({ queryKey: ['assistants'] });
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este assistente?')) {
      await assistantsService.delete(id);
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Voltar para o Chat"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Painel de Gestão de Assistentes & System Prompts
            </h1>
            <p className="text-xs text-slate-400">
              Cadastre novos tipos de assistentes jurídicos dinamicamente sem necessidade de deploy de código!
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Novo Assistente / Prompt
        </button>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Carregando assistentes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assistants.map((ast) => (
              <div
                key={ast.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-amber-500/40 transition shadow-xl relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <DynamicIcon name={ast.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-100">{ast.name}</h3>
                        <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                          {ast.category}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        ast.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {ast.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{ast.description}</p>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono space-y-1">
                    <p className="font-bold text-amber-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                      <FileCode className="w-3 h-3" /> System Prompt:
                    </p>
                    <p className="line-clamp-3 italic text-slate-400">{ast.systemPrompt}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Ordem: #{ast.order}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(ast)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(ast.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Form for Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-slate-100">
                  {editingAssistant ? 'Editar Assistente & System Prompt' : 'Cadastrar Novo Assistente Jurídico'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nome do Assistente</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Parecer Trabalhista Especializado"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoria</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Petições, Trabalhista, Contratos"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ícone Visual</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition ${
                        icon === ic
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <DynamicIcon name={ic} className="w-4 h-4" />
                      <span className="text-[10px]">{ic}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição Curta</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique resumidamente o propósito deste assistente..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  System Prompt da Inteligência Artificial (Instruções para o GPT-4o)
                </label>
                <textarea
                  required
                  rows={6}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Defina as regras, postura jurídica, legislação de referência e formato de resposta exigido..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-slate-100 font-mono text-xs focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Ordem de Exibição</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500 bg-slate-950"
                  />
                  <label htmlFor="isActive" className="font-semibold text-slate-300">
                    Assistente Ativo e Disponível no Menu
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
                >
                  Salvar Assistente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
