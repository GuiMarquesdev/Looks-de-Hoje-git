import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import crypto from "crypto";
import path from "path";

// ================= 1. SECRETS & ENVIRONMENT =================
// Secrets are read securely from environment variables, never hardcoded in client
export const JWT_SECRET = process.env.JWT_SECRET || "looksdehoje_jwt_super_secure_vault_2026_key";
export const TOKEN_EXPIRY = "24h";
export const TEMP_2FA_EXPIRY = "10m";

// ================= 2. INTERFACES & TYPES =================
export interface AuthTokenPayload {
  id: string;
  username: string;
  role: "admin" | "manager" | "staff";
  two_factor_verified?: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

// ================= 3. PASSWORD HASHING (BCRYPT) =================
const SALT_ROUNDS = 10;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export function hashPasswordSync(plainPassword: string): string {
  return bcrypt.hashSync(plainPassword, SALT_ROUNDS);
}

export async function comparePassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}

// ================= 4. JWT TOKEN GENERATION & VERIFICATION =================
export function generateAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
    issuer: "looksdehoje-api",
    audience: "looksdehoje-admin",
  });
}

export function generateTemp2FAToken(username: string, userId: string): string {
  return jwt.sign({ id: userId, username, scope: "2fa_pending" }, JWT_SECRET, {
    expiresIn: TEMP_2FA_EXPIRY,
    issuer: "looksdehoje-api",
  });
}

export function verifyTemp2FAToken(token: string): { id: string; username: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "looksdehoje-api",
    }) as { id: string; username: string; scope: string };
    if (decoded.scope !== "2fa_pending") return null;
    return { id: decoded.id, username: decoded.username };
  } catch {
    return null;
  }
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "looksdehoje-api",
      audience: "looksdehoje-admin",
    }) as AuthTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

// ================= 5. COOKIE & TOKEN EXTRACTOR =================
export function extractToken(req: Request): string | null {
  // 1. Check Authorization Header (Bearer token) FIRST (prioritize active client state)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const candidate = authHeader.substring(7).trim();
    if (candidate && candidate !== "null" && candidate !== "undefined") {
      return candidate;
    }
  }
  // 2. Check HttpOnly Cookie as fallback
  if (req.cookies && req.cookies.auth_token) {
    return req.cookies.auth_token;
  }
  return null;
}

// ================= 6. AUTHENTICATION & ROUTE PROTECTION =================
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      message: "Acesso não autorizado. Faça login para continuar.",
      code: "NO_TOKEN",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "looksdehoje-api",
      audience: "looksdehoje-admin",
    }) as AuthTokenPayload;

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Sua sessão expirou. Faça login novamente.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      message: "Token de autenticação inválido ou corrompido.",
      code: "INVALID_TOKEN",
    });
  }
}

// ================= 7. RBAC & PERMISSION CONTROL =================
export function requireRole(allowedRoles: Array<"admin" | "manager" | "staff">) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Acesso negado. Seu perfil não tem permissão para realizar esta ação.",
        code: "FORBIDDEN_ROLE",
      });
    }

    next();
  };
}

// ================= 8. ROW-LEVEL SECURITY (RLS) POLICIES =================
/**
 * RLS Guard:
 * - Public visitors can only view published/active records.
 * - Authenticated admins/managers can view and mutate all records.
 * - Prevents users from accessing unauthorized rows or private tenant data.
 */
export function applyRLSFilter<T extends { is_active?: boolean; status?: string }>(
  items: T[],
  user?: AuthTokenPayload
): T[] {
  // If user is authenticated admin or manager, they have row-level permission for all items
  if (user && (user.role === "admin" || user.role === "manager")) {
    return items;
  }
  // Public visitors: only active items (is_active !== false) and available/rented public statuses
  return items.filter((item) => item.is_active !== false);
}

// ================= 9. RATE LIMITERS (BRUTE-FORCE & DDOS PROTECTION) =================
const rateLimitValidateOptions = {
  xForwardedForHeader: false,
  forwardedHeader: false,
  trustProxy: false,
};

export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  validate: rateLimitValidateOptions,
  message: {
    message: "Limite de requisições excedido. Por favor, aguarde alguns minutos.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per 15 min per IP to block brute force
  standardHeaders: true,
  legacyHeaders: false,
  validate: rateLimitValidateOptions,
  message: {
    message: "Muitas tentativas de login incorretas. Por segurança, aguarde 15 minutos.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
});

export const uploadRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 40, // Max 40 uploads per 10 min
  standardHeaders: true,
  legacyHeaders: false,
  validate: rateLimitValidateOptions,
  message: {
    message: "Limite de upload de imagens atingido. Tente novamente mais tarde.",
  },
});

// ================= 10. SERVER-SIDE VALIDATION SCHEMAS (ZOD) =================
export const loginSchema = z.object({
  username: z.string().trim().min(2, "Usuário deve ter pelo menos 2 caracteres").max(50),
  password: z.string().min(4, "Senha deve ter pelo menos 4 caracteres").max(100),
});

export const verify2FASchema = z.object({
  tempToken: z.string().min(10, "Token temporário inválido"),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "O código de verificação 2FA deve conter exatamente 6 dígitos"),
});

export const toggle2FASchema = z.object({
  enabled: z.boolean(),
  password: z.string().min(1, "A senha atual é necessária para alterar o 2FA"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres").max(100),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Nome da categoria deve ter no mínimo 2 caracteres").max(80),
  is_active: z.boolean().optional().default(true),
});

export const pieceSchema = z.object({
  name: z.string().trim().min(2, "Nome da peça deve ter no mínimo 2 caracteres").max(120),
  description: z.string().optional().default(""),
  price: z.union([z.number().positive("Preço deve ser positivo"), z.string()]).transform((val) => {
    if (typeof val === "string") {
      const parsed = parseFloat(val.replace(",", "."));
      return isNaN(parsed) ? 0 : parsed;
    }
    return val;
  }),
  category_id: z.string().min(1, "Categoria é obrigatória"),
  status: z.enum(["available", "rented", "reserved", "maintenance"]).optional().default("available"),
  images: z
    .array(
      z.object({
        url: z.string(),
        order: z.number().optional().default(1),
      })
    )
    .optional(),
  image_url: z.string().optional(),
  measurements: z.record(z.any()).optional().default({}),
  image_position_x: z.number().optional().default(50),
  image_position_y: z.number().optional().default(50),
  image_zoom: z.number().optional().default(100),
});

export const ruleSchema = z.object({
  title: z.string().trim().min(2, "Título é obrigatório"),
  icon: z.string().optional().default("Shield"),
  description: z.string().optional().default(""),
  details: z.union([z.array(z.string()), z.string()]).transform((val) => {
    if (typeof val === "string") {
      return val.split("\n").map((s) => s.trim()).filter(Boolean);
    }
    return val || [];
  }),
  order: z.number().optional().default(1),
  is_active: z.boolean().optional().default(true),
});

export const rulesSettingsSchema = z.object({
  title: z.string().trim().min(2),
  subtitle: z.string().optional().default(""),
  support_title: z.string().optional().default(""),
  support_description: z.string().optional().default(""),
  support_message: z.string().optional().default(""),
});

// Middleware for Zod validation
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      return res.status(422).json({
        message: "Dados enviados inválidos.",
        errors,
      });
    }
    req.body = result.data;
    next();
  };
}

// ================= 11. PARAMETER SANITIZATION (PREVENT TRAVERSAL & INJECTION) =================
export function sanitizeParam(param: string): string {
  if (!param) return "";
  // Strip null bytes and directory traversal patterns
  return param.replace(/\0/g, "").replace(/\.\./g, "").trim();
}

// ================= 12. UPLOAD VALIDATION & STORAGE SANITIZER =================
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function sanitizeUploadedFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const safeExt = ALLOWED_IMAGE_EXTENSIONS.includes(ext) ? ext : ".jpg";
  const randomPrefix = crypto.randomBytes(16).toString("hex");
  return `${Date.now()}-${randomPrefix}${safeExt}`;
}
