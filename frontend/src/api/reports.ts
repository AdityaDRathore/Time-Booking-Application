import apiClient from '../services/apiClient';
import { LabUsageReport, UserActivityReport } from '../types/reports';

export const getLabUsageReport = async (start: string, end: string): Promise<LabUsageReport[]> => {
  const res = await apiClient.get('/reports/lab-usage', { params: { start, end } });
  return res.data.data;
};

export const getUserActivityReport = async (start: string, end: string): Promise<UserActivityReport[]> => {
  const res = await apiClient.get('/reports/user-activity', { params: { start, end } });
  return res.data.data;
};
