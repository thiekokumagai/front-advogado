import { api } from './api';
import { Assistant } from '../types';

export interface CreateAssistantPayload {
  name: string;
  icon: string;
  description: string;
  systemPrompt: string;
  category?: string;
  isActive?: boolean;
  order?: number;
}

export const assistantsService = {
  async getAll(): Promise<Assistant[]> {
    const { data } = await api.get<Assistant[]>('/assistants');
    return data;
  },

  async getOne(id: string): Promise<Assistant> {
    const { data } = await api.get<Assistant>(`/assistants/${id}`);
    return data;
  },

  async create(payload: CreateAssistantPayload): Promise<Assistant> {
    const { data } = await api.post<Assistant>('/assistants', payload);
    return data;
  },

  async update(id: string, payload: Partial<CreateAssistantPayload>): Promise<Assistant> {
    const { data } = await api.put<Assistant>(`/assistants/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/assistants/${id}`);
  },
};
