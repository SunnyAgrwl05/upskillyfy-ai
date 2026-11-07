import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // send cookies (refresh token) on cross-origin requests
})

API.interceptors.request.use((config) => {
  // Prefer the HttpOnly cookie set by the server; fall back to the Bearer
  // token stored in localStorage for non-browser clients.
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/**
 * On a 401 the access token has expired. The client should refresh via
 * the `/auth/refresh` endpoint, then retry the original request. If refresh
 * fails too, the token is cleared and the user is sent to the login page.
 */
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    if (!response || !config) return Promise.reject(error)

    const isAuthRoute = config.url?.includes('/auth/')
    if (response.status === 401 && !isAuthRoute && !config._retry) {
      config._retry = true
      try {
        const refreshRes = await API.post('/auth/refresh')
        const newToken = refreshRes.data.token
        if (newToken) {
          localStorage.setItem('token', newToken)
          config.headers.Authorization = `Bearer ${newToken}`
          return API(config)
        }
      } catch {
        // Refresh failed — clear local state and redirect.
        localStorage.removeItem('token')
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  },
)

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  googleLogin: (idToken) => API.post('/auth/google', { idToken }),
  verifyEmail: (code) => API.post('/auth/verify-email', { code }),
  resendVerification: () => API.post('/auth/resend-verification'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (data) => API.post('/auth/reset-password', data),
  logout: () => API.post('/auth/logout'),
  refresh: () => API.post('/auth/refresh'),
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
  deleteAccount: (password) => API.delete('/users/account', { data: { confirm: true, ...(password ? { password } : {}) } }),
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

export const resumeProjectAPI = {
  list: () => API.get('/resume-projects'),
  get: (id) => API.get(`/resume-projects/${encodeURIComponent(id)}`),
  create: (project) => API.post('/resume-projects', project),
  update: (id, project) => API.put(`/resume-projects/${encodeURIComponent(id)}`, project),
  remove: (id) => API.delete(`/resume-projects/${encodeURIComponent(id)}`),
  duplicate: (id, name) => API.post(`/resume-projects/${encodeURIComponent(id)}/duplicate`, name ? { name } : {}),
  archive: (id, archived = true) => API.post(`/resume-projects/${encodeURIComponent(id)}/archive`, { archived }),
  trash: (id, trashed = true) => API.post(`/resume-projects/${encodeURIComponent(id)}/trash`, { trashed }),
  restore: (id, archived = false) => API.post(`/resume-projects/${encodeURIComponent(id)}/restore`, { archived }),
  compile: (project) => API.post('/resume-projects/compile', project, { responseType: 'blob' }),
  sourceZip: (id) => API.get(`/resume-projects/${encodeURIComponent(id)}/source.zip`, { responseType: 'blob' }),
  importZip: (archive) => {
    const form = new FormData()
    form.append('archive', archive)
    return API.post('/resume-projects/import-zip', form)
  },
}

export const resumeAnalysisAPI = {
  analyzeFile: (file, payload) => {
    const form = new FormData()
    form.append('resume', file)
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') form.append(key, String(value))
    })
    return API.post('/resume-analysis/analyze', form)
  },
  analyzeProject: (payload) => API.post('/resume-analysis/analyze', payload),
  history: (params) => API.get('/resume-analysis/history', { params }),
  compare: (analysisId, otherAnalysisId) => API.post(`/resume-analysis/history/${encodeURIComponent(analysisId)}/compare`, { otherAnalysisId }),
  providerStatus: () => API.get('/resume-analysis/providers'),
}

export const latexTemplateAPI = {
  list: (params) => API.get('/latex-templates', { params }),
  get: (id) => API.get(`/latex-templates/${encodeURIComponent(id)}`),
}

export const hackathonAPI = {
  list: (params) => API.get('/hackathons', { params }),
  get: (slug) => API.get(`/hackathons/${encodeURIComponent(slug)}`),
  results: (slug) => API.get(`/hackathons/${encodeURIComponent(slug)}/results`),
  register: (slug, domainId) => API.post(`/hackathons/${encodeURIComponent(slug)}/register`, { domainId }),
  cancelRegistration: (slug) => API.delete(`/hackathons/${encodeURIComponent(slug)}/register`),
  myRegistrations: () => API.get('/hackathons/my/registrations'),
  createTeam: (slug, payload) => API.post(`/hackathons/${encodeURIComponent(slug)}/team`, payload),
  joinTeam: (slug, inviteCode) => API.post(`/hackathons/${encodeURIComponent(slug)}/team/join`, { inviteCode }),
  leaveTeam: (slug) => API.post(`/hackathons/${encodeURIComponent(slug)}/team/leave`),
  getTeam: (slug) => API.get(`/hackathons/${encodeURIComponent(slug)}/team`),
  removeTeamMember: (slug, userId) => API.delete(`/hackathons/${encodeURIComponent(slug)}/team/member/${encodeURIComponent(userId)}`),
  listMySubmissions: (slug) => API.get(`/hackathons/${encodeURIComponent(slug)}/submissions/my`),
  createSubmission: (slug, payload) => API.post(`/hackathons/${encodeURIComponent(slug)}/submissions`, payload),
  updateSubmission: (slug, submissionId, payload) => API.put(`/hackathons/${encodeURIComponent(slug)}/submissions/${encodeURIComponent(submissionId)}`, payload),
  submitSubmission: (slug, submissionId) => API.post(`/hackathons/${encodeURIComponent(slug)}/submissions/${encodeURIComponent(submissionId)}/submit`),
  createSubmissionUploadUrl: (slug, file) => API.post(`/hackathons/${encodeURIComponent(slug)}/submissions/upload-url`, file),
  confirmSubmissionFile: (slug, submissionId, file) => API.post(`/hackathons/${encodeURIComponent(slug)}/submissions/${encodeURIComponent(submissionId)}/files/confirm`, file),
  getSubmissionFileDownload: (slug, submissionId, fileId) => API.get(`/hackathons/${encodeURIComponent(slug)}/submissions/${encodeURIComponent(submissionId)}/files/${encodeURIComponent(fileId)}/download`),
  create: (payload) => API.post('/hackathons', payload),
  update: (slug, payload) => API.put(`/hackathons/${encodeURIComponent(slug)}`, payload),
  remove: (slug) => API.delete(`/hackathons/${encodeURIComponent(slug)}`),
  registrations: (slug, params) => API.get(`/hackathons/${encodeURIComponent(slug)}/registrations`, { params }),
  submissions: (slug) => API.get(`/hackathons/${encodeURIComponent(slug)}/submissions`),
  scoreSubmission: (slug, submissionId, payload) => API.post(`/hackathons/${encodeURIComponent(slug)}/submissions/${encodeURIComponent(submissionId)}/score`, payload),
  createAnnouncement: (slug, payload) => API.post(`/hackathons/${encodeURIComponent(slug)}/announcements`, payload),
  updateAnnouncement: (slug, announcementId, payload) => API.put(`/hackathons/${encodeURIComponent(slug)}/announcements/${encodeURIComponent(announcementId)}`, payload),
  publishResults: (slug) => API.post(`/hackathons/${encodeURIComponent(slug)}/publish-results`),
}

export default API
