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

export default API
