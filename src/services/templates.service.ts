import { api } from './api';
import { ContractTemplate } from '../types';

export interface CreateTemplatePayload {
  title: string;
  category?: string;
  description?: string;
  fileType?: 'pdf' | 'docx' | 'manual';
  content: string;
}

export interface ParseFileResponse {
  extractedText: string;
  filename: string;
  mimetype: string;
}

export const templatesService = {
  async getAll(): Promise<ContractTemplate[]> {
    const { data } = await api.get<ContractTemplate[]>('/templates');
    return data;
  },

  async getOne(id: string): Promise<ContractTemplate> {
    const { data } = await api.get<ContractTemplate>(`/templates/${id}`);
    return data;
  },

  async uploadFile(file: File): Promise<ParseFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<ParseFileResponse>('/templates/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async create(payload: CreateTemplatePayload): Promise<ContractTemplate> {
    const { data } = await api.post<ContractTemplate>('/templates', payload);
    return data;
  },

  async update(id: string, payload: Partial<CreateTemplatePayload>): Promise<ContractTemplate> {
    const { data } = await api.put<ContractTemplate>(`/templates/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/templates/${id}`);
  },
};
