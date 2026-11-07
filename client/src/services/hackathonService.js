import { hackathonAPI } from '../api'

export function unwrapHackathonResponse(response) {
  if (!response?.data?.success) {
    const error = new Error(response?.data?.message || 'The hackathon request failed.')
    error.code = response?.data?.code
    error.status = response?.status
    throw error
  }
  return response.data.data
}

export function getHackathonError(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || error?.message || fallback
}

export async function fetchHackathons(params) {
  const response = await hackathonAPI.list(params)
  return {
    items: unwrapHackathonResponse(response) || [],
    pagination: response.data.pagination || { page: 1, limit: 20, total: 0, pages: 1 },
  }
}

export async function fetchHackathon(slug) {
  return unwrapHackathonResponse(await hackathonAPI.get(slug))
}

export async function fetchHackathonResults(slug) {
  return unwrapHackathonResponse(await hackathonAPI.results(slug))
}

export async function fetchMyRegistrations() {
  return unwrapHackathonResponse(await hackathonAPI.myRegistrations()) || []
}

export async function fetchHackathonTeam(slug) {
  return unwrapHackathonResponse(await hackathonAPI.getTeam(slug))
}

export async function fetchMySubmissions(slug) {
  return unwrapHackathonResponse(await hackathonAPI.listMySubmissions(slug)) || []
}

export async function fetchOrganizerSubmissions(slug) {
  return unwrapHackathonResponse(await hackathonAPI.submissions(slug)) || []
}

export async function createHackathon(payload) {
  return unwrapHackathonResponse(await hackathonAPI.create(payload))
}

export async function updateHackathon(slug, payload) {
  return unwrapHackathonResponse(await hackathonAPI.update(slug, payload))
}

export async function deleteHackathon(slug) {
  return unwrapHackathonResponse(await hackathonAPI.remove(slug))
}

export function formatHackathonDate(value, options = {}) {
  if (!value) return 'Date to be announced'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date to be announced'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    ...options,
  }).format(date)
}

export function formatHackathonDateRange(startDate, endDate) {
  if (!startDate && !endDate) return 'Dates to be announced'
  if (!endDate) return formatHackathonDate(startDate)
  return `${formatHackathonDate(startDate)} – ${formatHackathonDate(endDate)}`
}
