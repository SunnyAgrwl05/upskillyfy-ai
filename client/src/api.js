import axios from 'axios'

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    const raw = import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '')
    return raw.endsWith('/api') ? raw : `${raw}/api`
  }
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
  apply: (id, data) => API.post(`/internships/${id}/apply`, data),
  getMyApplications: () => API.get('/internships/my/applications'),
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
  getPlayback: (slug, lectureId) => API.get(`/courses/${slug}/lectures/${lectureId}/playback`),
  playLecture: (slug, lectureId) => API.post(`/courses/${slug}/lectures/${lectureId}/play`),
}

export const resourceAPI = {
  getAll: (params) => API.get('/resources', { params }),
  getOne: (id) => API.get(`/resources/${id}`),
  download: (id) => API.post(`/resources/${id}/download`),
  bookmark: (id) => API.post(`/resources/${id}/bookmark`),
}

export const roadmapAPI = {
  getAll: (params) => API.get('/roadmaps', { params }),
  getOne: (id) => API.get(`/roadmaps/${id}`),
  seed: () => API.post('/roadmaps/seed'),
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
  getMyAttempts: () => API.get('/assessments/my/attempts'),
}

export const resumeProjectAPI = {
  list: () => API.get('/resume-projects'),
  get: (id) => API.get(`/resume-projects/${encodeURIComponent(id)}`),
  create: (project) => API.post('/resume-projects', project),
  update: (id, project) => API.put(`/resume-projects/${encodeURIComponent(id)}`, project),
  remove: (id) => API.delete(`/resume-projects/${encodeURIComponent(id)}`),
  compile: (project) => API.post('/resume-projects/compile', project, { responseType: 'blob' }),
  sourceZip: (id) => API.get(`/resume-projects/${encodeURIComponent(id)}/source.zip`, { responseType: 'blob' }),
  importZip: (archive) => {
    const form = new FormData()
    form.append('archive', archive)
    return API.post('/resume-projects/import-zip', form)
  },
}

export const latexTemplateAPI = {
  list: (params) => API.get('/latex-templates', { params }),
  get: (id) => API.get(`/latex-templates/${encodeURIComponent(id)}`),
}

export const certificateAPI = {
  getMine: () => API.get('/certificates/my'),
  getOne: (id) => API.get(`/certificates/${encodeURIComponent(id)}`),
  download: (id) => API.get(`/certificates/${encodeURIComponent(id)}/download`, { responseType: 'blob' }),
}

export const documentAPI = {
  getMine: () => API.get('/documents/my'),
  getOne: (id) => API.get(`/documents/${encodeURIComponent(id)}`),
  download: (id) => API.get(`/documents/${encodeURIComponent(id)}/download`, { responseType: 'blob' }),
}

export const verificationAPI = {
  verify: (token) => API.get(`/verification/${encodeURIComponent(token)}`),
}

export const adminCredentialAPI = {
  findStudents: (search) => API.get('/admin/credentials/students', { params: { search } }),
  getCourses: () => API.get('/admin/credentials/courses'),
  getCertificates: () => API.get('/admin/credentials/certificates'),
  previewCertificate: (data) => API.post('/admin/credentials/certificates/preview', data, { responseType: 'blob' }),
  issueCertificate: (data) => API.post('/admin/credentials/certificates', data),
  revokeCertificate: (id, reason) => API.patch(`/admin/credentials/certificates/${encodeURIComponent(id)}/revoke`, { reason }),
  getDocuments: () => API.get('/admin/credentials/documents'),
  uploadDocument: (data) => {
    const form = new FormData()
    Object.entries(data).forEach(([key, value]) => form.append(key, value))
    return API.post('/admin/credentials/documents', form)
  },
  revokeDocument: (id, reason) => API.patch(`/admin/credentials/documents/${encodeURIComponent(id)}/revoke`, { reason }),
}

export default API
