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
  withCredentials: true,
})

const templateListCache = new Map()
const templateDetailCache = new Map()
const acceptsCachedStatus = (status) => (status >= 200 && status < 300) || status === 304

function stableQueryKey(params = {}) {
  return JSON.stringify(Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right)))
}

function validateTemplateList(data) {
  if (!data || !Array.isArray(data.templates) || !data.pagination
    || !Number.isFinite(data.pagination.page) || !Number.isFinite(data.pagination.pages)
    || !Number.isFinite(data.pagination.total)) {
    throw Object.assign(new Error('The template catalogue returned an invalid response.'), { code: 'INVALID_TEMPLATE_RESPONSE' })
  }
  return data
}

function validateTemplateDetail(data) {
  if (!data?.template || typeof data.template.id !== 'string') {
    throw Object.assign(new Error('The template detail response was empty or invalid.'), { code: 'INVALID_TEMPLATE_RESPONSE' })
  }
  return data
}

async function getTemplateData(url, key, cache, validate, params, signal) {
  const config = {
    params,
    signal,
    headers: { 'Cache-Control': 'no-cache, no-store' },
    validateStatus: acceptsCachedStatus,
  }
  let response = await API.get(url, config)
  if (response.status === 304) {
    const cached = cache.get(key)
    if (cached) return { ...response, status: 200, data: cached }

    // A fresh page can receive a conditional 304 without a JS cache to supply
    // the body. One cache-busting retry forces an unconditional JSON response.
    response = await API.get(url, {
      ...config,
      params: { ...(params || {}), _resumeRefresh: Date.now() },
      headers: { ...config.headers, Pragma: 'no-cache' },
    })
    if (response.status === 304) {
      throw Object.assign(new Error('The template server returned 304 without a cached response.'), { code: 'TEMPLATE_CACHE_MISS' })
    }
  }
  const data = validate(response.data)
  cache.set(key, data)
  return { ...response, data }
}

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  google: (data) => API.post('/auth/google', data),
  me: () => API.get('/auth/me'),
  logout: () => API.post('/auth/logout'),
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
  create: (project) => API.post('/resume-projects', serializeResumeProject(project)),
  update: (id, project) => API.put(`/resume-projects/${encodeURIComponent(id)}`, serializeResumeProject({ ...project, id })),
  remove: (id) => API.delete(`/resume-projects/${encodeURIComponent(id)}`),
  compile: (project) => API.post('/resume-projects/compile', serializeResumeProject(project), { responseType: 'blob' }),
  sourceZip: (id) => API.get(`/resume-projects/${encodeURIComponent(id)}/source.zip`, { responseType: 'blob' }),
  importZip: (archive) => {
    const form = new FormData()
    form.append('archive', archive)
    return API.post('/resume-projects/import-zip', form)
  },
}

function serializeResumeProject(project = {}) {
  return {
    id: project.id,
    name: project.name ?? project.title,
    mainFile: project.mainFile,
    templateId: project.templateId || null,
    tags: Array.isArray(project.tags) ? project.tags : [],
    archived: project.archived === true,
    trashed: project.trashed === true,
    files: (Array.isArray(project.files) ? project.files : []).map((file) => ({
      path: file.path ?? file.name,
      content: file.content,
      isBinary: file.isBinary === true,
    })),
  }
}

export const latexTemplateAPI = {
  list: (params, { signal } = {}) => getTemplateData(
    '/latex-templates', stableQueryKey(params), templateListCache, validateTemplateList, params, signal,
  ),
  get: (id, { signal } = {}) => {
    const key = String(id)
    return getTemplateData(
      `/latex-templates/${encodeURIComponent(key)}`, key, templateDetailCache, validateTemplateDetail, undefined, signal,
    )
  },
  previewPdf: (id, { signal } = {}) => API.get(
    `/latex-templates/${encodeURIComponent(id)}/preview.pdf`, { responseType: 'blob', signal },
  ),
}

export const resumeAnalysisAPI = {
  analyze: (file, jobDescription = '', saveToHistory = false, onUploadProgress) => {
    const form = new FormData()
    form.append('resume', file)
    if (jobDescription.trim()) form.append('jobDescription', jobDescription.trim())
    if (saveToHistory) form.append('saveToHistory', 'true')
    return API.post('/resume-analysis', form, { onUploadProgress })
  },
  usage: () => API.get('/resume-analysis/usage'),
  list: (params) => API.get('/resume-analysis', { params }),
  get: (id) => API.get(`/resume-analysis/${encodeURIComponent(id)}`),
  saveReview: (id, payload) => API.patch(`/resume-analysis/${encodeURIComponent(id)}/review`, payload),
  remove: (id) => API.delete(`/resume-analysis/${encodeURIComponent(id)}`),
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
