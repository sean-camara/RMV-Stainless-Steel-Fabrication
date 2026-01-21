import api from './client';
import type { Appointment, Project, Payment } from '../types';

// Appointments API
export const appointmentApi = {
  create: async (data: {
    scheduledDate: string;
    scheduledTime?: string;
    appointmentType: 'office_consultation' | 'ocular_visit';
    interestedCategory?: string;
    description?: string;
    siteAddress?: object;
    notes?: string;
  }) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    date?: string;
  }) => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  getMine: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    // Backend's /appointments endpoint filters by role - customers only see their own
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  getSlots: async (date: string, salesStaffId?: string) => {
    const response = await api.get('/appointments/slots', {
      params: { date, salesStaffId },
    });
    return response.data;
  },

  getAvailable: async (dateOrParams: string | { startDate: string; endDate: string }) => {
    const params = typeof dateOrParams === 'string' 
      ? { date: dateOrParams }
      : dateOrParams;
    const response = await api.get('/appointments/available', { params });
    return response.data;
  },

  getCalendar: async (startDate: string, endDate: string) => {
    const response = await api.get('/appointments/calendar', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  assign: async (id: string, salesStaffId: string, agentNotes?: string) => {
    const response = await api.put(`/appointments/${id}/assign`, {
      salesStaffId,
      agentNotes,
    });
    return response.data;
  },

  cancel: async (
    id: string,
    data?: {
      reason?: string;
      message?: string;
    }
  ) => {
    const response = await api.put(`/appointments/${id}/cancel`, data || {});
    return response.data;
  },

  complete: async (id: string, salesNotes?: string) => {
    const response = await api.put(`/appointments/${id}/complete`, { salesNotes });
    return response.data;
  },

  markNoShow: async (id: string) => {
    const response = await api.put(`/appointments/${id}/no-show`);
    return response.data;
  },

  setTravelFee: async (id: string, data: { amount: number; notes?: string; isRequired?: boolean }) => {
    const response = await api.put(`/appointments/${id}/travel-fee`, data);
    return response.data;
  },

  collectTravelFee: async (id: string, data: { collectedAmount: number; notes?: string }) => {
    const response = await api.put(`/appointments/${id}/travel-fee/collect`, data);
    return response.data;
  },

  verifyTravelFee: async (id: string, data: { notes?: string }) => {
    const response = await api.put(`/appointments/${id}/travel-fee/verify`, data);
    return response.data;
  },
};

// Projects API
export const projectApi = {
  create: async (data: Partial<Project> | object) => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  }) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  getMine: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get('/projects/my-projects', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  getPendingForEngineer: async () => {
    const response = await api.get('/projects/pending/engineer');
    return response.data;
  },

  getFabrication: async () => {
    const response = await api.get('/projects/fabrication');
    return response.data;
  },

  getFabricationProjects: async () => {
    const response = await api.get('/projects/fabrication');
    return response.data;
  },

  updateConsultation: async (id: string, data: { notes?: string; measurements?: object[] }) => {
    const response = await api.put(`/projects/${id}/consultation`, data);
    return response.data;
  },

  uploadConsultationPhotos: async (id: string, files: FormData) => {
    const response = await api.post(`/projects/${id}/consultation/photos`, files, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  submitToEngineer: async (id: string, engineerId: string) => {
    const response = await api.put(`/projects/${id}/submit-to-engineer`, { engineerId });
    return response.data;
  },

  uploadBlueprint: async (id: string, formData: FormData) => {
    const response = await api.post(`/projects/${id}/blueprint`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadCosting: async (id: string, formData: FormData) => {
    const response = await api.post(`/projects/${id}/costing`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  submitForApproval: async (id: string) => {
    const response = await api.put(`/projects/${id}/submit-for-approval`);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await api.put(`/projects/${id}/approve`);
    return response.data;
  },

  requestRevision: async (id: string, description: string, type: 'minor' | 'major' = 'minor') => {
    const response = await api.put(`/projects/${id}/request-revision`, { description, type });
    return response.data;
  },

  updateStatus: async (id: string, statusOrData: string | { status: string; notes?: string }, notes?: string) => {
    const data = typeof statusOrData === 'string' 
      ? { status: statusOrData, notes } 
      : statusOrData;
    const response = await api.put(`/projects/${id}/status`, data);
    return response.data;
  },

  updateQuotation: async (id: string, data: { materialCost: number; laborCost: number; estimatedDays: number }) => {
    const response = await api.put(`/projects/${id}/quotation`, data);
    return response.data;
  },

  reviewBlueprint: async (id: string, data: { approved: boolean; feedback?: string }) => {
    const response = await api.put(`/projects/${id}/blueprint/review`, data);
    return response.data;
  },

  updateFabricationProgress: async (id: string, progress: number, notes?: string) => {
    const response = await api.put(`/projects/${id}/fabrication/progress`, { progress, notes });
    return response.data;
  },

  uploadFabricationPhoto: async (id: string, formData: FormData) => {
    const response = await api.post(`/projects/${id}/fabrication/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Payments API
export const paymentApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    stage?: string;
  }) => {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  getMine: async () => {
    const response = await api.get('/payments/my-payments');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  getByProject: async (projectId: string) => {
    const response = await api.get(`/payments/project/${projectId}`);
    return response.data;
  },

  getMyPayments: async () => {
    const response = await api.get('/payments/my-payments');
    return response.data;
  },

  getPending: async () => {
    const response = await api.get('/payments/pending');
    return response.data;
  },

  getSummary: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/payments/summary', { params });
    return response.data;
  },

  uploadQRCode: async (id: string, formData: FormData) => {
    const response = await api.post(`/payments/${id}/qrcode`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadProof: async (id: string, formData: FormData) => {
    const response = await api.post(`/payments/${id}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  submitProof: async (id: string, formData: FormData) => {
    const response = await api.post(`/payments/${id}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  verify: async (id: string, data: {
    amountReceived: number;
    referenceNumber?: string;
    notes?: string;
  }) => {
    const response = await api.put(`/payments/${id}/verify`, data);
    return response.data;
  },

  reject: async (id: string, reason: string) => {
    const response = await api.put(`/payments/${id}/reject`, { reason });
    return response.data;
  },
};

// Users API
export const userApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getByRole: async (role: string) => {
    const response = await api.get(`/users/role/${role}`);
    return response.data;
  },

  create: async (data: {
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  update: async (id: string, data: object) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deactivate: async (id: string) => {
    const response = await api.put(`/users/${id}/deactivate`);
    return response.data;
  },

  reactivate: async (id: string) => {
    const response = await api.put(`/users/${id}/reactivate`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getActivityLogs: async (params?: {
    page?: number;
    limit?: number;
    action?: string;
    resourceType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/admin/activity-logs', { params });
    return response.data;
  },

  getReports: async (params?: {
    type?: 'revenue' | 'projects' | 'appointments';
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },

  getAllProjects: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  }) => {
    const response = await api.get('/admin/projects', { params });
    return response.data;
  },

  updatePaymentStages: async (
    projectId: string,
    stages: { initial: number; midpoint: number; final: number }
  ) => {
    const response = await api.put(`/admin/projects/${projectId}/payment-stages`, stages);
    return response.data;
  },
};

// Notifications API
export const notificationApi = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};
