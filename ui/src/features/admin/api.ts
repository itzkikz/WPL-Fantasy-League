import apiClient from "../../api/client";
import { SubstitutionHistoryRecord, SubstitutionType } from "./types";

export const adminApi = {
  getSubstitutionHistory: async (params?: { teamId?: string; gameweek?: number; type?: SubstitutionType }): Promise<SubstitutionHistoryRecord[]> => {
    const response = await apiClient.get('/admin/substitutions', { params });
    return response.data.data;
  },
};