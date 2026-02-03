/**
 * Zod schemas for task validation (client-side and before sending to API).
 */

import { z } from 'zod'

const taskStatusSchema = z.enum(['To Do', 'In Progress', 'In Review', 'Done'])
const taskPrioritySchema = z.enum(['Low', 'Medium', 'High', 'Urgent'])

export const taskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(5000).optional().default(''),
  status: taskStatusSchema.optional().default('To Do'),
  priority: taskPrioritySchema.optional().default('Medium'),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val === '' || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: 'Due date must be YYYY-MM-DD or leave empty',
    })
    .transform((val) => (val === '' || val == null ? undefined : val)),
  tags: z.array(z.string().max(50)).optional().default([]),
  estimatedHours: z.number().min(0).max(999).optional().default(0),
  actualHours: z.number().min(0).max(999).optional().default(0),
})

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  title: z.string().min(1).max(500).optional(),
})

export const taskSchema = taskCreateSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().nullable(),
})

export type TaskCreateSchema = z.infer<typeof taskCreateSchema>
export type TaskUpdateSchema = z.infer<typeof taskUpdateSchema>
export type TaskSchema = z.infer<typeof taskSchema>
