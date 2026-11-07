import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

let transporter

// Unit and integration tests never send real email, even if a developer's .env
// contains provider credentials.
export const emailConfigured = env.NODE_ENV !== 'test' && Boolean(env.EMAIL_USER && env.EMAIL_PASS)

function getTransporter() {
  if (!emailConfigured) return null
  if (!transporter) {
    const transportOptions = env.EMAIL_HOST
      ? { host: env.EMAIL_HOST, port: env.EMAIL_PORT || 587, secure: env.EMAIL_SECURE }
      : { service: env.EMAIL_SERVICE || 'gmail' }
    transporter = nodemailer.createTransport({ ...transportOptions, auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS } })
  }
  return transporter
}

export async function sendEmail({ to, subject, text, html }) {
  const activeTransport = getTransporter()
  if (!activeTransport) return false
  await activeTransport.sendMail({ from: env.EMAIL_FROM || env.EMAIL_USER, to, subject, text, html })
  return true
}
