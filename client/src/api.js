import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
  enroll: (id) => API.post(`/learning/courses/${id}/enroll`),
  getProgress: (id) => API.get(`/learning/courses/${id}/progress`),
  recordLastLesson: (id, lessonId) => API.post(`/learning/courses/${id}/last-lesson`, { lessonId }),
  updateProgress: (id, lessonId, completed) => API.put(`/learning/courses/${id}/lessons/${encodeURIComponent(lessonId)}`, { completed }),
}

export const learningAPI = {
  getProgress: () => API.get('/learning/progress'),
  getRoadmapProgress: (id) => API.get(`/learning/roadmaps/${id}/progress`),
  updateRoadmapSkill: (id, skill, mastered) => API.put(`/learning/roadmaps/${id}/skills`, { skill, mastered }),
}

export const assessmentAPI = {
  getAll: (params) => API.get('/assessments', { params }),
  getOne: (id) => API.get(`/assessments/${encodeURIComponent(id)}`),
  start: (id) => API.post(`/assessments/${encodeURIComponent(id)}/attempts`),
  getAttempt: (id) => API.get(`/assessments/attempts/${id}`),
  saveAnswer: (attemptId, questionId, data) => API.put(`/assessments/attempts/${attemptId}/answers/${questionId}`, data),
  submit: (id) => API.post(`/assessments/attempts/${id}/submit`),
  getHistory: () => API.get('/assessments/me/history'),
  adminList: () => API.get('/assessments/admin'),
  adminResults: () => API.get('/assessments/admin/results'),
  adminAttempt: (id) => API.get(`/assessments/admin/attempts/${id}`),
  create: (data) => API.post('/assessments/admin', data),
  update: (id, data) => API.put(`/assessments/admin/${id}`, data),
}

export const resourceAPI = {
  getAll: (params) => API.get('/resources', { params }),
  getOne: (id) => API.get(`/resources/${id}`),
  download: (id) => API.post(`/resources/${id}/download`),
  bookmark: (id) => API.post(`/resources/${id}/bookmark`),
}

export default API
