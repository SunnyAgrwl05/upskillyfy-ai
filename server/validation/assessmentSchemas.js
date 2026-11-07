import { z } from 'zod'

export const startAttemptSchema = z.object({
  testId: z.string().min(1, 'testId is required'),
})

export const submitAttemptSchema = z.object({
  attemptId: z.string().min(1, 'attemptId is required'),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedOption: z.number().int().nonnegative().optional().nullable(),
    }),
  ).optional(),
})

export const objectIdSchema = z.object({
  id: z.string().min(1, 'id is required'),
})

const assessmentPathId = z.string().trim().min(1).max(100).regex(/^[a-z\d][a-z\d_-]*$/i, 'Invalid assessment identifier.')
export const branchIdParamsSchema = z.object({ branchId: assessmentPathId })
export const testIdParamsSchema = z.object({ testId: assessmentPathId })
