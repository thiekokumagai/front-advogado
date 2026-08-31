import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './context/AuthContext';
import { assistantsService } from './services/assistants.service';
import { conversationsService } from './services/conversations.service';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatGPTChat } from './components/ChatGPTChat';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';
import { PushNotificationManager } from './components/PushNotificationManager';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminAssistantsPage } from './pages/AdminAssistantsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { Assistant, Conversation } from './types';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-amber-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const MainDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch Assistants
  const { data: assistants = [], isLoading: loadingAssistants } = useQuery({
    queryKey: ['assistants'],
    queryFn: assistantsService.getAll,
  });

  // Select default first assistant when loaded
  useEffect(() => {
    if (assistants.length > 0 && !selectedAssistant) {
      setSelectedAssistant(assistants[0]);
    }
  }, [assistants]);

  // Load active conversation details when activeConversationId changes
  useEffect(() => {
    if (activeConversationId) {
      conversationsService.getOne(activeConversationId).then((conv) => {
        setActiveConversation(conv);
        if (conv.assistant) {
          setSelectedAssistant(conv.assistant);
        }
      });
    } else {
      setActiveConversation(null);
    }
  }, [activeConversationId]);

  const handleSelectAssistant = (ast: Assistant) => {
    setSelectedAssistant(ast);
    setActiveConversationId(null);
    setActiveConversation(null);
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setActiveConversation(null);
  };

  const handleOpenAdmin = () => {
    navigate('/admin/assistants');
  };

  if (loadingAssistants || !selectedAssistant) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs font-semibold text-slate-400">Carregando assistentes jurídicos...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-950 overflow-hidden">
      <Sidebar
        activeConversationId={activeConversationId}
        onSelectAssistant={handleSelectAssistant}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onOpenAdmin={handleOpenAdmin}
      />

      <div className="flex-1 flex flex-col h-full min-w-0">
        <Header currentAssistant={selectedAssistant} onNewChat={handleNewChat} />
        <ChatGPTChat
          assistant={selectedAssistant}
          conversation={activeConversation}
          onConversationCreated={(conv) => {
            setActiveConversation(conv);
            setActiveConversationId(conv.id);
          }}
        />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assistants"
          element={
            <ProtectedRoute>
              <AdminAssistantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global PWA Update Notification Component */}
      <PWAUpdatePrompt />

      {/* Global Push Notification Manager */}
      <PushNotificationManager />
    </>
  );
};
