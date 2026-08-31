import { api } from './api';
import { User, OfficeStats, Role } from '../types';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export const adminService = {
  async getUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>('/admin/users');
    return data;
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    const { data } = await api.post<User>('/admin/users', payload);
    return data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  },

  async getStats(): Promise<OfficeStats> {
    const { data } = await api.get<OfficeStats>('/admin/stats');
    return data;
  },
};
