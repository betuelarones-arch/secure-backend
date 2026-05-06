const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
  fullName: z.string().min(2, 'Nombre completo requerido'),
  storeId: z.string().uuid('ID de tienda inválido').optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

const mfaVerifySchema = z.object({
  token: z.string().length(6, 'El código debe tener 6 dígitos'),
  tempToken: z.string().min(1, 'Token temporal requerido'),
});

const createRoleSchema = z.object({
  name: z.enum(['ADMIN', 'GERENTE', 'EMPLEADO', 'AUDITOR']),
  description: z.string().optional(),
});

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener mayúscula')
    .regex(/[0-9]/, 'Debe contener número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener carácter especial'),
  fullName: z.string().min(2, 'Nombre requerido'),
  storeId: z.string().uuid().optional(),
  role: z.enum(['ADMIN', 'GERENTE', 'EMPLEADO', 'AUDITOR']).optional(),
});

const assignRoleSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  role: z.enum(['ADMIN', 'GERENTE', 'EMPLEADO', 'AUDITOR']),
});

const createProductSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  description: z.string().optional(),
  price: z.number().positive('Precio debe ser positivo'),
  stock: z.number().int().min(0).default(0),
  category: z.string().min(2, 'Categoría requerida'),
  storeId: z.string().uuid('ID de tienda inválido'),
  isPremium: z.boolean().default(false),
});

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  category: z.string().min(2).optional(),
  isPremium: z.boolean().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  mfaVerifySchema,
  createRoleSchema,
  createUserSchema,
  assignRoleSchema,
  createProductSchema,
  updateProductSchema,
};
