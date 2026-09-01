export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'LAWYER';

export interface Office {
  id: string;
  name: string;
  subdomain: string;
  cnpj?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  office: Office;
}

export interface Assistant {
  id: string;
  officeId?: string | null;
  name: string;
  icon: string;
  description: string;
  systemPrompt: string;
  category: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  conversationId: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  fileSize: number;
  filePath: string;
  extractedText?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensUsed?: number;
  createdAt: string;
}

export interface Conversation {
  id: string;
  officeId: string;
  userId: string;
  assistantId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  assistant: Assistant;
  messages: Message[];
  attachments: Attachment[];
  _count?: {
    messages: number;
    attachments: number;
  };
}

export interface ContractTemplate {
  id: string;
  officeId: string;
  title: string;
  category: string;
  description?: string;
  fileType?: 'pdf' | 'docx' | 'manual';
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeStats {
  totalConversations: number;
  totalMessages: number;
  totalUsers: number;
  totalAssistants: number;
}
