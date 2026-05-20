import { z } from 'zod';

export const BUG_REPORT_CONTENT_MIN = 5;
export const BUG_REPORT_CONTENT_MAX = 2000;

export const bugReportSchema = z.object({
  content: z
    .string()
    .min(BUG_REPORT_CONTENT_MIN, { message: 'too_short' })
    .max(BUG_REPORT_CONTENT_MAX, { message: 'too_long' }),
});

export type BugReportSchema = z.infer<typeof bugReportSchema>;
