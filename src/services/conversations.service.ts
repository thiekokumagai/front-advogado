import { api } from './api';
import { Conversation, Message, Attachment } from '../types';

export const conversationsService = {
  async getAll(): Promise<Conversation[]> {
    const { data } = await api.get<Conversation[]>('/conversations');
    return data;
  },

  async getOne(id: string): Promise<Conversation> {
    const { data } = await api.get<Conversation>(`/conversations/${id}`);
    return data;
  },

  async create(assistantId: string, title?: string): Promise<Conversation> {
    const { data } = await api.post<Conversation>('/conversations', { assistantId, title });
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/conversations/${id}`);
  },

  async sendMessage(conversationId: string, content: string): Promise<{ userMessage: Message; assistantMessage: Message }> {
    const { data } = await api.post<{ userMessage: Message; assistantMessage: Message }>(
      `/conversations/${conversationId}/messages`,
      { content },
    );
    return data;
  },

  async uploadAttachment(conversationId: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<Attachment>(
      `/conversations/${conversationId}/attachments`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return data;
  },

  async exportMessage(conversationId: string, messageId: string, format: 'pdf' | 'docx' = 'docx'): Promise<Blob> {
    const response = await api.get(
      `/conversations/${conversationId}/messages/${messageId}/export?format=${format}`,
      { responseType: 'blob' },
    );
    return response.data;
  },
};
