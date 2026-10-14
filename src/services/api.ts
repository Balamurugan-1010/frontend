import axios from 'axios';
import {
  Manager,
  College,
  Candidate,
  JobRole,
  CandidateMatch,
  ShortlistEntry,
  DashboardStats,
  AssessmentItem,
} from '../types';

// In dev: Vite proxy handles /api -> localhost:8000
// In production on Vercel: API serverless functions are at /api on the same domain
// VITE_API_BASE_URL can override if backend is hosted separately
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('talentmatch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired and not on login page
      if (window.location.pathname.startsWith('/manager') && window.location.pathname !== '/manager/login') {
        localStorage.removeItem('talentmatch_token');
        localStorage.removeItem('talentmatch_manager');
        window.location.href = '/manager/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ access_token: string; token_type: string; manager: Manager }>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },
  sendOtp: async (email: string) => {
    const res = await api.post<{
      message: string;
      email: string;
      expires_in_seconds: number;
      cooldown_seconds: number;
    }>('/auth/send-otp', {
      email,
    });
    return res.data;
  },
  verifyOtp: async (email: string, otp: string) => {
    const res = await api.post<{ access_token: string; token_type: string; manager: Manager }>('/auth/verify-otp', {
      email,
      otp,
    });
    return res.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('talentmatch_token');
      localStorage.removeItem('talentmatch_manager');
    }
  },
  getMe: async () => {
    const res = await api.get<Manager>('/auth/me');
    return res.data;
  },
};

export const candidateService = {
  register: async (candidateData: {
    name: string;
    email: string;
    phone: string;
    college_name?: string;
    department?: string;
    graduation_year?: number;
    cgpa?: number;
    areas_of_interest?: string;
    skills?: string[];
    projects?: { project_name: string; description?: string }[];
    internships?: { company: string; description?: string; duration?: string }[];
    certifications?: { name: string; issuer?: string }[];
  }) => {
    const res = await api.post<Candidate>('/candidates', candidateData);
    return res.data;
  },
  uploadResume: async (candidateId: number, file: File, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/candidates/${candidateId}/resume`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return res.data;
  },
  getAll: async (params?: { college_id?: number; department?: string; min_cgpa?: number; search?: string }) => {
    const res = await api.get<Candidate[]>('/candidates', { params });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<Candidate>(`/candidates/${id}`);
    return res.data;
  },
  getResumeDownloadUrl: (candidateId: number) => `/api/candidates/${candidateId}/resume/download`,
  downloadResume: async (candidateId: number) => {
    const res = await api.get<Blob>(`/candidates/${candidateId}/resume/download`, {
      responseType: 'blob',
    });
    return res.data;
  },
};

export const collegeService = {
  getAll: async () => {
    const res = await api.get<College[]>('/colleges');
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<College>(`/colleges/${id}`);
    return res.data;
  },
  create: async (name: string, location?: string) => {
    const res = await api.post<College>('/colleges', { name, location });
    return res.data;
  },
};

export const jobRoleService = {
  getAll: async () => {
    const res = await api.get<JobRole[]>('/job-roles');
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<JobRole>(`/job-roles/${id}`);
    return res.data;
  },
  create: async (roleData: {
    company_name: string;
    role_name: string;
    job_description: string;
    minimum_cgpa: number;
    eligible_departments: string;
    experience_requirement?: string;
    college_id?: number;
    required_skills: { skill_name: string; required: boolean }[];
  }) => {
    const res = await api.post<JobRole>('/job-roles', roleData);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/job-roles/${id}`);
    return res.data;
  },
  parseJdPdf: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<{ filename: string; extracted_text: string; detected_skills: string[] }>(
      '/job-roles/parse-jd-pdf',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  },
};

export const matchingService = {
  run: async (payload: { job_role_id: number; college_id?: number; only_eligible?: boolean }) => {
    const res = await api.post<CandidateMatch[]>('/matching/run', payload);
    return res.data;
  },
  getExisting: async (jobRoleId: number, collegeId?: number) => {
    const res = await api.get<CandidateMatch[]>(`/matching/${jobRoleId}`, {
      params: { college_id: collegeId },
    });
    return res.data;
  },
  compare: async (jobRoleId: number, candidateIds: number[]) => {
    const res = await api.post<{ candidate: Candidate; match?: CandidateMatch }[]>('/matching/compare', {
      job_role_id: jobRoleId,
      candidate_ids: candidateIds,
    });
    return res.data;
  },
};

export const shortlistService = {
  create: async (jobRoleId: number, candidateIds: number[], status: string = 'Shortlisted') => {
    const res = await api.post<ShortlistEntry[]>('/shortlists', {
      job_role_id: jobRoleId,
      candidate_ids: candidateIds,
      status,
    });
    return res.data;
  },
  getAll: async (params?: { job_role_id?: number; college_id?: number; department?: string; status_filter?: string }) => {
    const res = await api.get<ShortlistEntry[]>('/shortlists', { params });
    return res.data;
  },
  updateStatus: async (id: number, status: string) => {
    const res = await api.put<ShortlistEntry>(`/shortlists/${id}`, { status });
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/shortlists/${id}`);
    return res.data;
  },
};

export const documentService = {
  generateShortlistDocx: async (jobRoleId: number, candidateIds: number[], includeFullDetails: boolean = true) => {
    const res = await api.post<{
      message: string;
      filename: string;
      download_url: string;
      candidate_count: number;
    }>('/documents/shortlist', {
      job_role_id: jobRoleId,
      candidate_ids: candidateIds,
      include_full_details: includeFullDetails,
    });
    return res.data;
  },
  generateShortlistPdf: async (jobRoleId: number | null, candidateIds: number[]) => {
    const res = await api.post<Blob>(
      '/documents/generate-pdf',
      {
        job_role_id: jobRoleId,
        candidate_ids: candidateIds,
      },
      {
        responseType: 'blob',
      }
    );
    return res.data;
  },
  downloadShortlistDocx: async (filename: string) => {
    const res = await api.get<Blob>(`/documents/shortlist/${encodeURIComponent(filename)}/download`, {
      responseType: 'blob',
    });
    return res.data;
  },
};

/**
 * Helper to trigger an authenticated blob download in the browser.
 */
export const triggerBlobDownload = (blobData: BlobPart, filename: string, mimeType: string) => {
  const blob = new Blob([blobData], { type: mimeType });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

export const statsService = {
  getDashboardStats: async () => {
    const res = await api.get<DashboardStats>('/stats/dashboard');
    return res.data;
  },
};

export const assessmentService = {
  getAll: async (jobRoleId?: number) => {
    const res = await api.get<AssessmentItem[]>('/assessments', {
      params: { job_role_id: jobRoleId },
    });
    return res.data;
  },
  create: async (payload: { candidate_id: number; job_role_id: number; assessment_type: string; score?: number; status?: string }) => {
    const res = await api.post('/assessments', payload);
    return res.data;
  },
  update: async (id: number, payload: { score?: number; status?: string }) => {
    const res = await api.put(`/assessments/${id}`, payload);
    return res.data;
  },
};

export default api;
