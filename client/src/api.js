import axios from 'axios'

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  // In development, default to local express server
  if (import.meta.env.DEV) return 'http://localhost:5000/api'
  // In production (e.g. Vercel), avoid pinging localhost:5000 to prevent PNA browser popup
  return '/api'
}

const API = axios.create({
  baseURL: getBaseURL(),
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
}

export const internshipAPI = {
  getAll: (params) => API.get('/internships', { params }),
  getOne: (id) => API.get(`/internships/${id}`),
  seed: () => API.post('/internships/seed'),
}

export const contactAPI = {
  send: (data) => API.post('/contact', data),
}

export const communityAPI = {
  getAll: () => API.get('/community'),
  seed: () => API.post('/community/seed'),
}

export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
  saveInternship: (id) => API.post(`/users/save-internship/${id}`),
}

export const newsletterAPI = {
  subscribe: (email) => API.post('/newsletter/subscribe', { email }),
  unsubscribe: (email) => API.post('/newsletter/unsubscribe', { email }),
}

export const courseAPI = {
  getAll: (params) => API.get('/courses', { params }),
  getOne: (id) => API.get(`/courses/${id}`),
  enroll: (id) => API.post(`/courses/${id}/enroll`),
  updateProgress: (id, data) => API.post(`/courses/${id}/progress`, data),
}

export const resourceAPI = {
  getAll: (params) => API.get('/resources', { params }),
  getOne: (id) => API.get(`/resources/${id}`),
  download: (id) => API.post(`/resources/${id}/download`),
  bookmark: (id) => API.post(`/resources/${id}/bookmark`),
}

export const assessmentAPI = {
  getBranches: () => API.get('/assessments/branches'),
  getBranch: (branchId) => API.get(`/assessments/branches/${branchId}`),
  getBranchTests: (branchId) => API.get(`/assessments/branches/${branchId}/tests`),
  getTest: (testId) => API.get(`/assessments/tests/${testId}`),
  getTestQuestions: (testId) => API.get(`/assessments/tests/${testId}/questions`),
  startAttempt: (testId) => API.post('/assessments/attempts/start', { testId }),
  submitAttempt: (payload) => API.post('/assessments/attempts/submit', payload),
  getTestResult: (testId) => API.get(`/assessments/tests/${testId}/result`),
}

export default API
