import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { templatesService, CreateTemplatePayload } from '../services/templates.service';
import { ContractTemplate } from '../types';
import {
  FileText,
  Upload,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Search,
  ArrowLeft,
  FileCode,
  Sparkles,
  Loader2,
  Eye,
  Send,
  FileType,
  Copy,
  CheckCircle2,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Prestação de Serviços',
  'Honorários Advocatícios',
  'Locação e Imóveis',
  'Contrato de Trabalho',
  'Acordo de Confidencialidade (NDA)',
  'Societário e Parcerias',
  'Geral',
];

export const ContractTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<ContractTemplate | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Prestação de Serviços');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'docx' | 'manual'>('manual');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch Templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: templatesService.getAll,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateTemplatePayload) => templatesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      closeModal();
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateTemplatePayload> }) =>
      templatesService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      closeModal();
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => templatesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const openCreateModal = () => {
    setEditingTemplate(null);
    setTitle('');
    setCategory('Prestação de Serviços');
    setDescription('');
    setContent('');
    setFileType('manual');
    setIsModalOpen(true);
  };

  const openEditModal = (template: ContractTemplate) => {
    setEditingTemplate(template);
    setTitle(template.title);
    setCategory(template.category || 'Geral');
    setDescription(template.description || '');
    setContent(template.content);
    setFileType(template.fileType || 'manual');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  // Handle File Upload Parsing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const type: 'pdf' | 'docx' | 'manual' = ext === 'pdf' ? 'pdf' : ext === 'docx' || ext === 'doc' ? 'docx' : 'manual';

    try {
      setIsUploading(true);
      const result = await templatesService.uploadFile(file);

      // Pre-fill form
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setFileType(type);
      setContent(result.extractedText);
    } catch (err: any) {
      alert('Erro ao ler o arquivo. Certifique-se de que é um documento PDF ou DOCX válido.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Preencha o título e o conteúdo do modelo.');
      return;
    }

    const payload: CreateTemplatePayload = {
      title,
      category,
      description,
      fileType,
      content,
    };

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este modelo de contrato?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleUseInAssistant = (template: ContractTemplate) => {
    // Copy content or navigate to chat
    navigator.clipboard.writeText(template.content);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 3000);
    navigate('/');
  };

  // Filtering logic
  const categoriesList = Array.from(new Set(templates.map((t) => t.category).filter(Boolean)));
  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Header Bar */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition"
            title="Voltar ao Chat"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-extrabold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <FileCode className="w-5 h-5 text-amber-500" />
              Modelos de Contratos
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gerencie seus modelos contratuais padrão para utilizar na IA e modernização de minutas
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Novo Modelo
        </button>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Search & Category Filter Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar modelos por nome ou conteúdo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-transparent"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Todos ({templates.length})
            </button>

            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Carregando modelos de contratos...</span>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <FileType className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Nenhum modelo de contrato encontrado
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Faça o upload do seu primeiro arquivo PDF/DOCX ou crie um modelo em texto para reutilizar com a IA.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20"
            >
              <Upload className="w-4 h-4" />
              Upload de Modelo (PDF / DOCX)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/50 dark:hover:border-amber-500/40 transition group shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Top Bar Card */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {template.fileType?.toUpperCase() || 'MANUAL'}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {template.category}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition line-clamp-1">
                    {template.title}
                  </h3>
                  {template.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Text Snippet Preview */}
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {template.content}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Atualizado em {new Date(template.updatedAt).toLocaleDateString('pt-BR')}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewingTemplate(template)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Visualizar Conteúdo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(template)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 transition"
                      title="Editar Modelo"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition"
                      title="Excluir Modelo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUseInAssistant(template)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition shadow-sm"
                      title="Copiar texto do modelo e abrir o Chat de IA"
                    >
                      {copiedId === template.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Usar na IA
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal View Template Details */}
      {viewingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{viewingTemplate.title}</h2>
                  <p className="text-xs text-slate-500">Categoria: {viewingTemplate.category}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingTemplate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 whitespace-pre-wrap leading-relaxed">
              {viewingTemplate.content}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-white dark:bg-slate-900">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewingTemplate.content);
                  alert('Texto do modelo copiado para a área de transferência!');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <Copy className="w-4 h-4" />
                Copiar Texto
              </button>
              <button
                onClick={() => {
                  setViewingTemplate(null);
                  handleUseInAssistant(viewingTemplate);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-600 transition shadow-md"
              >
                <Send className="w-4 h-4" />
                Usar no Chat de IA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create / Edit Template */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {editingTemplate ? 'Editar Modelo de Contrato' : 'Cadastrar Novo Modelo'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Faça upload de um arquivo PDF/DOCX ou preencha os dados manualmente.
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* File Upload Drop Zone */}
              <div className="p-4 border-2 border-dashed border-amber-500/40 bg-amber-500/5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.pdf,.doc"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="template-file-upload"
                />
                <label
                  htmlFor="template-file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2 w-full py-2"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center space-y-2">
                      <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        Extraindo texto do arquivo...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Clique aqui para enviar um arquivo (PDF ou DOCX)
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          O conteúdo textual será lido e extraído automaticamente para o campo de texto abaixo.
                        </p>
                      </div>
                    </>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Título do Modelo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Contrato Padrão de Prestação de Serviços 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição / Notas (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Modelo atualizado com cláusulas LGPD e rescisão simplificada"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Editable Content Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Conteúdo / Texto do Modelo *
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {content.length} caracteres
                  </span>
                </div>
                <textarea
                  required
                  rows={10}
                  placeholder="Cole aqui o texto completo do seu modelo de contrato com as cláusulas desejadas..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none custom-scrollbar leading-relaxed"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingTemplate ? 'Atualizar Modelo' : 'Salvar Modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
