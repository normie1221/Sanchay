import { z } from 'zod';

// Income Validation
export const createIncomeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  source: z.string().min(1, 'Source is required'),
  description: z.string().optional(),
  category: z.enum(['SALARY', 'BUSINESS', 'INVESTMENT', 'FREELANCE', 'GIFT', 'OTHER']),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME']),
  date: z.string().or(z.date()),
  isRecurring: z.boolean().optional(),
});

export const updateIncomeSchema = createIncomeSchema.partial();

// Expense Validation
export const createExpenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  merchant: z.string().optional(),
  paymentMethod: z.string().optional(),
  location: z.string().optional(),
  date: z.string().or(z.date()),
  isRecurring: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

// Financial Goal Validation
export const createGoalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().min(0).optional(),
  deadline: z.string().or(z.date()).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  category: z.enum(['SAVINGS', 'INVESTMENT', 'DEBT_PAYMENT', 'EMERGENCY_FUND', 'RETIREMENT', 'PURCHASE', 'EDUCATION', 'OTHER']),
});

export const updateGoalSchema = createGoalSchema.partial();

// Budget Validation
export const createBudgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  limit: z.number().positive('Limit must be positive'),
  period: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  alerts: z.boolean().optional(),
  alertThreshold: z.number().min(0).max(100).optional(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

// Query Validation
export const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// Type exports
export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
