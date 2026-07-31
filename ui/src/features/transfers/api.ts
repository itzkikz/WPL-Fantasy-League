import apiClient from "../../api/client";
import { Transfer, TransferInput } from "./types";

export const transfersApi = {
  getTransfers: async (params?: { teamId?: string; gameweek?: number }): Promise<Transfer[]> => {
    const response = await apiClient.get('/admin/transfers', { params });
    return response.data.data;
  },

  createTransfer: async (data: TransferInput): Promise<Transfer> => {
    const response = await apiClient.post('/admin/transfers', data);
    return response.data.data;
  },

  reverseTransfer: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/transfers/${id}`);
  },
};
