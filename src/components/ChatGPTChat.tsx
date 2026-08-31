import React, { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Assistant, Conversation, Message, Attachment } from '../types';
import { conversationsService } from '../services/conversations.service';
import { MarkdownRenderer } from './MarkdownRenderer';
import { DynamicIcon } from './DynamicIcon';
import {
  Send,
  Paperclip,
  FileText,
  Download,
  Copy,
  Check,
  Bot,
  User as UserIcon,
  Loader2,
  FileCode,
  ShieldCheck,
  X,
} from 'lucide-react';

interface ChatGPTChatProps {
  assistant: Assistant;
  conversation: Conversation | null;
  onConversationCreated: (conversation: Conversation) => void;
}

export const ChatGPTChat: React.FC<ChatGPTChatProps> = ({
  assistant,
  conversation,
  onConversationCreated,
}) => {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>(conversation?.messages || []);
  const [attachments, setAttachments] = useState<Attachment[]>(conversation?.attachments || []);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync messages & attachments when conversation changes
  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages || []);
      setAttachments(conversation.attachments || []);
    } else {
      setMessages([]);
      setAttachments([]);
    }
  }, [conversation?.id]);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isSending) return;

    setInputMessage('');
    setIsSending(true);

    try {
      let activeConv = conversation;

      // If no conversation active yet, create one
      if (!activeConv) {
        activeConv = await conversationsService.create(assistant.id);
        onConversationCreated(activeConv);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }

      // Optimistic user message update
      const tempUserMsg: Message = {
        id: `temp-${Date.now()}`,
        conversationId: activeConv.id,
        role: 'user',
        content: textToSend,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      // Send to backend API
      const result = await conversationsService.sendMessage(activeConv.id, textToSend);

      // Replace optimistic state with real API response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        result.userMessage,
        result.assistantMessage,
      ]);

      // Invalidate query so Sidebar conversation history updates instantly in real time!
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (error: any) {
      alert(`Erro ao enviar mensagem: ${error?.response?.data?.message || error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccessMsg(null);
    try {
      let activeConv = conversation;
      if (!activeConv) {
        activeConv = await conversationsService.create(assistant.id);
        onConversationCreated(activeConv);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }

      const uploadedAtt = await conversationsService.uploadAttachment(activeConv.id, file);
      setAttachments((prev) => [...prev, uploadedAtt]);
      setUploadSuccessMsg(`Arquivo "${file.name}" anexado com sucesso ao contexto da IA!`);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      // Focus textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } catch (error: any) {
      alert(`Erro no upload do arquivo: ${error?.response?.data?.message || error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleExport = async (messageId: string, format: 'docx' | 'pdf') => {
    if (!conversation) return;
    try {
      const blob = await conversationsService.exportMessage(conversation.id, messageId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Documento_Juridico_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`Erro ao exportar documento: ${err.message}`);
    }
  };

  const handleQuickPromptClick = (text: string) => {
    handleSend(undefined, text);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative transition-colors duration-200">
      {/* Transcript Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
        {/* Welcome Assistant Card */}
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto my-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
              <DynamicIcon name={assistant.icon} className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                {assistant.category}
              </span>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">{assistant.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                {assistant.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left pt-4">
              <button
                type="button"
                onClick={() => handleQuickPromptClick('Elabore a estrutura jurídica inicial com base nos fatos que descreverei a seguir.')}
                className="p-3 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 cursor-pointer transition text-xs text-left group shadow-sm"
              >
                <p className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-amber-500 dark:group-hover:text-amber-400">💡 Estrutura de Peça</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Elaborar minuta inicial estruturada</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPromptClick('Analise a jurisprudência aplicável e teses repetitivas para este caso.')}
                className="p-3 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 cursor-pointer transition text-xs text-left group shadow-sm"
              >
                <p className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-amber-500 dark:group-hover:text-amber-400">📚 Pesquisa de Teses</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Mapear decisões e súmulas STF/STJ</p>
              </button>
            </div>
          </div>
        )}

        {/* Message Transcript */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`group relative rounded-2xl p-4 sm:p-5 max-w-3xl text-sm leading-relaxed transition ${
                  isUser
                    ? 'bg-amber-500/10 text-amber-900 dark:text-amber-100 border border-amber-500/30 rounded-tr-none'
                    : 'bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 shadow-md dark:shadow-lg rounded-tl-none'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <>
                    <MarkdownRenderer content={msg.content} />

                    {/* Action Bar for AI Response */}
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400/80 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Portal IA Advocacia
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition"
                          title="Copiar texto"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                              <span className="text-[11px] text-emerald-500 dark:text-emerald-400">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Copiar</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleExport(msg.id, 'docx')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 transition text-[11px] font-semibold"
                          title="Exportar em Word (DOCX)"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          DOCX
                        </button>

                        <button
                          onClick={() => handleExport(msg.id, 'pdf')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30 transition text-[11px] font-semibold"
                          title="Exportar em PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 font-bold text-xs">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isSending && (
          <div className="flex gap-3 max-w-4xl mx-auto justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redigindo fundamentação com {assistant.name}...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box and Attachments Toolbar */}
      <div className="p-4 bg-white/80 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Upload Success Alert Banner */}
          {uploadSuccessMsg && (
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
              <span>{uploadSuccessMsg}</span>
              <button onClick={() => setUploadSuccessMsg(null)} className="hover:text-emerald-900 dark:hover:text-emerald-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Uploaded Attachments Chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs text-slate-700 dark:text-slate-200 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span className="truncate max-w-xs font-medium">{att.fileName}</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400/80 uppercase font-bold">({att.fileType})</span>
                </div>
              ))}
            </div>
          )}

          {/* Form Controls */}
          <form onSubmit={(e) => handleSend(e)} className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus-within:border-amber-500/50 rounded-2xl shadow-md dark:shadow-xl transition">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.doc"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-3 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition rounded-l-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60"
              title="Anexar PDF ou DOCX para incluir no contexto da IA"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-500 dark:text-amber-400" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
            </button>

            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                attachments.length > 0
                  ? `Arquivo anexado! Digite sua instrução sobre o documento enviado para o ${assistant.name}...`
                  : `Digite suas instruções para o ${assistant.name} (Pressione Enter para enviar)...`
              }
              rows={1}
              className="w-full bg-transparent py-3.5 px-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none max-h-32 custom-scrollbar"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="m-1.5 p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl transition font-bold disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 pt-1">
            As respostas são geradas por Inteligência Artificial e devem ser validadas pelo advogado responsável.
          </p>
        </div>
      </div>
    </div>
  );
};
