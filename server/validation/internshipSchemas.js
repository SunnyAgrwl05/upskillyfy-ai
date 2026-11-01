import { z } from 'zod'

export const createInternshipSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  company: z.string().trim().min(2, 'Company must be at least 2 characters').max(200),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000),
  branch: z.array(z.string()).default(['All']),
  skills: z.array(z.string()).default([]),
  stipend: z.string().default('Unpaid'),
  duration: z.string().trim().min(1, 'Duration is required').max(100),
  mode: z.enum(['Remote', 'On-site', 'Hybrid', 'On-campus'], {
    required_error: 'Mode is required',
    invalid_type_error: 'Invalid mode',
  }),
  location: z.string().default('Remote'),
  applyLink: z.string().url('Invalid apply link').optional().or(z.literal('')),
  deadline: z.preprocess((val) => (val ? new Date(val) : undefined), z.date().optional()),
  status: z.enum(['Open', 'Closing Soon', 'Closed', 'New']).default('Open'),
  logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  isVerified: z.boolean().default(false),
})

export const updateInternshipSchema = createInternshipSchema.partial()
