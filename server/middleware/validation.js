import { z } from 'zod';

export const createPostcardSchema = z.object({
  frontImageId: z.string().uuid('Invalid front image ID'),
  backImageId: z.string().uuid('Invalid back image ID'),
  senderName: z.string().min(1).max(100).optional(),
  recipientName: z.string().min(1).max(100).optional(),
  sentDate: z.string().datetime().optional(),
  deliveredDate: z.string().datetime().optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['pending', 'sent', 'delivered']).optional()
});

export const updatePostcardSchema = z.object({
  senderName: z.string().min(1).max(100).optional(),
  recipientName: z.string().min(1).max(100).optional(),
  sentDate: z.string().datetime().optional().nullable(),
  deliveredDate: z.string().datetime().optional().nullable(),
  description: z.string().max(500).optional(),
  status: z.enum(['pending', 'sent', 'delivered']).optional()
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12)
});

export const imageQuerySchema = z.object({
  ...paginationSchema.shape,
  type: z.enum(['front', 'back']).optional()
});

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.errors
      });
    }
    req.validatedBody = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: result.error.errors
      });
    }
    req.validatedQuery = result.data;
    next();
  };
}
