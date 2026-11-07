import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  branch: z.string().max(60).optional(),
  college: z.string().max(160).optional(),
  year: z.string().max(40).optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})

export const emailVerificationSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit verification code.'),
})

export const googleLoginSchema = z.object({
  idToken: z.string().min(1).max(8192),
})

export const accountDeletionSchema = z.object({
  confirm: z.literal(true),
  password: z.string().max(128).optional(),
}).strict()

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80).optional(),
  branch: z.string().max(60).optional(),
  college: z.string().max(160).optional(),
  year: z.string().max(40).optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
})

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  branch: z.string().max(60).optional(),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(2000),
})
