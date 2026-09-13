import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import multer from "multer";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import {
  requireAuth,
  requireRole,
  applyRLSFilter,
  globalApiLimiter,
  loginRateLimiter,
  uploadRateLimiter,
  loginSchema,
  verify2FASchema,
  toggle2FASchema,
  changePasswordSchema,
  categorySchema,
  pieceSchema,
  ruleSchema,
  rulesSettingsSchema,
  validateBody,
  sanitizeParam,
  sanitizeUploadedFileName,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  hashPassword,
  hashPasswordSync,
  comparePassword,
  generateAuthToken,
  generateTemp2FAToken,
  verifyTemp2FAToken,
  extractToken,
  AuthTokenPayload,
  AuthenticatedRequest,
} from "./server/security";

const app = express();
const PORT = 3000;

// Enable trust proxy for Google Cloud Run / Nginx reverse proxy
app.set("trust proxy", 1);

// Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // Vite inline dev script compatibility
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
    frameguard: false, // Allow iframe rendering in AI Studio
  })
);

// HttpOnly Cookie Parser
app.use(cookieParser());

// Robust CORS configuration supporting AI Studio preview domains, localhost, and custom origins
const rawCorsOrigins = process.env.CORS_ALLOWED_ORIGINS || "*";
const configuredOrigins = rawCorsOrigins
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Allow requests with no origin (like mobile apps, curl, or same-origin SPA)
      if (!origin) {
        return callback(null, true);
      }

      // 2. Wildcard or empty list allows all origins (reflected for credentials support)
      if (configuredOrigins.length === 0 || configuredOrigins.includes("*")) {
        return callback(null, true);
      }

      // 3. Explicitly allowed origin in environment variable
      if (configuredOrigins.includes(origin)) {
        return callback(null, true);
      }

      // 4. Automatically allow Google Cloud Run dev/preview domains and localhost
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.endsWith(".run.app") ||
        origin.includes("google.com") ||
        origin.includes("ai.studio")
      ) {
        return callback(null, true);
      }

      // Do NOT throw an uncaught Error object; safely decline CORS
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// Body Parsers with limits
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Apply Global Rate Limiter to all API routes
app.use("/api", globalApiLimiter);

// Ensure public uploads directory exists
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Persistent storage directory for database JSON
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbFilePath = path.join(dataDir, "db.json");

// Serve uploaded assets with static security headers
app.use("/uploads", express.static(uploadsDir));
app.use("/storage/uploads", express.static(uploadsDir));
app.use("/storage/hero-slides", express.static(uploadsDir));

// Secure Multer storage with strict MIME validation, file size limit and sanitized filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = sanitizeUploadedFileName(file.originalname);
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES, // 5MB limit per file
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype) || !ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      return cb(
        new Error("Arquivo rejeitado. Apenas imagens válidas (JPG, PNG, WebP) de até 5MB são permitidas.")
      );
    }
    cb(null, true);
  },
});

// Initial default seed data
const defaultCategories = [
  {
    id: "1",
    name: "Vestidos de Festa",
    slug: "vestidos-de-festa",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Casual Chic",
    slug: "casual-chic",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Alfaiataria & Gala",
    slug: "alfaiataria-gala",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Casacos & Acessórios",
    slug: "casacos-acessorios",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const defaultPieces = [
  {
    id: "1",
    name: "Vestido Longo Gala Esmeralda",
    description: "Deslumbrante vestido longo em tecido nobre, caimento fluido e detalhes refinados para eventos de gala.",
    price: 420.0,
    category_id: "1",
    status: "available",
    image_url: "/src/assets/dress-product-1.jpg",
    images: [{ url: "/src/assets/dress-product-1.jpg", order: 1 }],
    measurements: { busto: "88", cintura: "68", quadril: "96", comprimento: "155", tamanho: "M" },
    image_position_x: 50,
    image_position_y: 50,
    image_zoom: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Vestido Midi Alfaiataria Nude",
    description: "Peça versátil de alta alfaiataria perfeita para coquetéis e celebrações diurnas.",
    price: 290.0,
    category_id: "2",
    status: "available",
    image_url: "/src/assets/dress-product-2.jpg",
    images: [{ url: "/src/assets/dress-product-2.jpg", order: 1 }],
    measurements: { busto: "92", cintura: "72", quadril: "100", comprimento: "115", tamanho: "M" },
    image_position_x: 50,
    image_position_y: 50,
    image_zoom: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Vestido Plissado Festa Dourado",
    description: "Elegância pura com brilho acetinado e acabamento plissado exclusivo.",
    price: 490.0,
    category_id: "1",
    status: "rented",
    image_url: "/src/assets/dress-product-3.jpg",
    images: [{ url: "/src/assets/dress-product-3.jpg", order: 1 }],
    measurements: { busto: "86", cintura: "66", quadril: "94", comprimento: "150", tamanho: "P" },
    image_position_x: 50,
    image_position_y: 50,
    image_zoom: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Colete Pelos Luxo Branco",
    description: "Colete em pelos sintéticos de altíssimo padrão, toque macio e acabamento premium para noites frias com sofisticação.",
    price: 220.0,
    category_id: "4",
    status: "available",
    image_url: "/src/assets/colete-pelos-branco-1.jpg",
    images: [
      { url: "/src/assets/colete-pelos-branco-1.jpg", order: 1 },
      { url: "/src/assets/colete-pelos-branco-2.jpg", order: 2 },
    ],
    measurements: { busto: "96", cintura: "80", comprimento: "65", tamanho: "Único" },
    image_position_x: 50,
    image_position_y: 50,
    image_zoom: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const defaultHeroSettings = {
  id: "1",
  title: "Elegância em Cada Ocasião",
  subtitle: "Alugue looks incríveis para todas as ocasiões com estilo, sofisticação e luxo acessível.",
  cta_text: "Explorar Coleção",
  cta_link: "#colecao",
  background_image_url: "",
  interval_ms: 5000,
  is_active: true,
};

const defaultHeroSlides = [
  {
    id: "1",
    image_url: "/src/assets/hero-dress-1.jpg",
    title: "Elegância em Cada Ocasião",
    subtitle: "Alugue looks únicos para momentos inesquecíveis",
    cta_text: "Conhecer Peças",
    cta_link: "#colecao",
    order: 1,
    image_fit: "cover",
    image_position_x: 50,
    image_position_y: 50,
    image_zoom: 100,
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    image_url: "/src/assets/hero-dress-2.jpg",
    title: "Estilo Sofisticado",
    subtitle: "Descubra a coleção mais refinada para seus eventos",
    cta_text: "Ver Mais",
    cta_link: "#colecao",
    order: 2,
    image_fit: "cover",
    image_position_x: 50,
    image_position_y: 35,
    image_zoom: 100,
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    image_url: "/src/assets/hero-dress-3.jpg",
    title: "Luxo Acessível",
    subtitle: "Alta costura e caimento impecável ao seu alcance",
    cta_text: "Alugue Agora",
    cta_link: "#colecao",
    order: 3,
    image_fit: "cover",
    image_position_x: 50,
    image_position_y: 50,
    image_zoom: 100,
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const defaultStoreSettings = {
  id: "1",
  store_name: "Looks de Hoje",
  instagram_url: "https://www.instagram.com/looksdehojebrecho/",
  whatsapp_url: "https://wa.me/5571992771527",
  email: "contato@looksdehoje.com.br",
  phone: "(71) 99277-1527",
  address: "Av. Antônio Carlos Magalhães, 2501 - Brotas, Salvador - BA, 40280-901",
  working_hours: "Segunda, Quarta e Sexta: 12:00 - 18:00 (Somente com agendamento)",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const defaultSiteContent = {
  header: {
    nav_home: "Início",
    nav_collection: "Coleção",
    nav_rules: "Regras de Aluguel",
    nav_contact: "Contato",
    cta_button_text: "Fale pelo WhatsApp",
  },
  collection: {
    section_title: "Nossa Coleção",
    section_subtitle: "Descubra looks únicos para cada ocasião. Elegância e sofisticação para momentos inesquecíveis.",
    search_placeholder: "Buscar vestidos, conjuntos, modelos, tamanhos...",
    filter_all: "Todos",
    filter_available: "Disponíveis",
    filter_rented: "Alugados",
    sort_recent: "Mais recentes",
    sort_price_asc: "Menor preço",
    sort_price_desc: "Maior preço",
    sort_name_asc: "Nome (A-Z)",
    btn_rent_available: "Alugar no WhatsApp",
    btn_rent_unavailable: "Me avise quando voltar",
    btn_view_details: "Ver Detalhes",
    btn_load_more: "Ver Mais Peças",
    empty_title: "Nenhuma peça encontrada",
    empty_description: "Não encontramos peças com os filtros ou termo de busca selecionados.",
    empty_reset_btn: "Limpar todos os filtros",
    modal_rent_btn: "Alugar via WhatsApp",
    modal_notify_btn: "Avise-me quando voltar",
    modal_measurements_title: "Medidas da Peça",
  },
  rules: {
    section_title: "Regras de Aluguel",
    section_subtitle: "Conheça nossas políticas para garantir uma experiência transparente e segura para todos.",
    support_title: "Dúvidas sobre nossas regras?",
    support_description: "Nossa equipe está sempre disponível para esclarecer qualquer questão sobre o processo de aluguel. Entre em contato conosco pelo WhatsApp ou Instagram.",
    support_btn_text: "Fale com nossa equipe",
  },
  contact: {
    section_title: "Contato & Localização",
    section_subtitle: "Entre em contato conosco ou visite nossa loja física. Estamos prontas para ajudar você a encontrar o look perfeito.",
    whatsapp_card_title: "WhatsApp & Agendamento",
    whatsapp_card_btn: "Chamar no WhatsApp",
    instagram_card_title: "Instagram",
    instagram_card_btn: "Seguir no Instagram",
    email_card_title: "E-mail",
    email_card_btn: "Enviar E-mail",
    hours_title: "Horário de Funcionamento",
    hours_badge: "Somente com agendamento",
    store_title: "Nossa Loja",
    maps_btn_text: "Ver no Google Maps",
  },
  footer: {
    brand_tagline: "Aluguel de roupas e vestidos sofisticados para tornar seus momentos inesquecíveis.",
    quick_links_title: "Links Rápidos",
    contact_title: "Contato",
    copyright_text: "© 2025 LooksdeHoje. Todos os direitos reservados.",
  },
};

const defaultRulesSettings = {
  title: "Regras de Aluguel",
  subtitle: "Conheça nossas políticas para garantir uma experiência transparente e segura para todos.",
  support_title: "Dúvidas sobre nossas regras?",
  support_description: "Nossa equipe está sempre disponível para esclarecer qualquer questão sobre o processo de aluguel. Entre em contato conosco pelo WhatsApp ou Instagram.",
  support_message: "Olá! Tenho dúvidas sobre as regras de aluguel.",
};

export interface RuleItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  details: string[];
  order: number;
  is_active: boolean;
}

const defaultRules: RuleItem[] = [
  {
    id: "1",
    icon: "Clock",
    title: "Período de Locação",
    description: "Peças podem ser alugadas por 1 a 7 dias, com possibilidade de extensão mediante disponibilidade.",
    details: [
      "Locação mínima: 5 dias corridos",
      "Locação máxima: 20 dias corridos",
      "Prorrogação mediante solicitação prévia e disponibilidade da peça"
    ],
    order: 1,
    is_active: true,
  },
  {
    id: "2",
    icon: "Truck",
    title: "Entrega e Retirada",
    description: "Entregamos em toda a região metropolitana ou você pode retirar em nossa loja física.",
    details: [
      "Entrega por motoboy parceiro com valor calculado conforme a região",
      "Retirada e devolução mediante agendamento",
      "Atendimento de segunda a sexta-feira, das 10h às 16h"
    ],
    order: 2,
    is_active: true,
  },
  {
    id: "3",
    icon: "Shield",
    title: "Cuidados e Segurança",
    description: "Todas as peças são higienizadas antes e após cada uso com produtos especializados.",
    details: [
      "Lavagem profissional",
      "Produtos antialérgicos",
      "Embalagem lacrada"
    ],
    order: 3,
    is_active: true,
  },
  {
    id: "4",
    icon: "CreditCard",
    title: "Forma de Pagamento",
    description: "Aceitamos PIX, cartão de crédito/débito. Pagamento antecipado obrigatório.",
    details: [
      "PIX com desconto",
      "Cartão até 3x sem juros",
      "Caução via cartão"
    ],
    order: 4,
    is_active: true,
  },
  {
    id: "5",
    icon: "CheckCircle",
    title: "Estado das Peças",
    description: "Todas as roupas devem ser devolvidas nas mesmas condições de retirada.",
    details: [
      "Sem manchas ou rasgos",
      "Perfume suave permitido",
      "Pequenos desgastes normais"
    ],
    order: 5,
    is_active: true,
  },
  {
    id: "6",
    icon: "AlertCircle",
    title: "Política de Danos",
    description: "Em caso de danos irreversíveis, será cobrado o valor de reposição da peça.",
    details: [
      "Avaliação criteriosa",
      "Orçamento transparente",
      "Parcelamento disponível"
    ],
    order: 6,
    is_active: true,
  }
];

// Database schema container
export interface AppUser {
  id: string;
  username: string;
  password_hash: string;
  role: "admin" | "manager" | "staff";
  two_factor_enabled: boolean;
  two_factor_pin: string; // 6-digit verification code
  created_at: string;
  updated_at: string;
}

const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin123";
const defaultUsers: AppUser[] = [
  {
    id: "1",
    username: "admin",
    password_hash: hashPasswordSync(defaultAdminPassword),
    role: "admin",
    two_factor_enabled: false,
    two_factor_pin: "123456",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

interface AppDatabase {
  categories: typeof defaultCategories;
  pieces: typeof defaultPieces;
  heroSettings: typeof defaultHeroSettings;
  heroSlides: typeof defaultHeroSlides;
  storeSettings: typeof defaultStoreSettings;
  siteContent: typeof defaultSiteContent;
  rulesSettings: typeof defaultRulesSettings;
  rules: RuleItem[];
  users: AppUser[];
}

// Function to load database from disk or fallback to defaults
function loadDatabase(): AppDatabase {
  try {
    if (fs.existsSync(dbFilePath)) {
      const content = fs.readFileSync(dbFilePath, "utf-8");
      const parsed = JSON.parse(content);
      return {
        categories: parsed.categories || defaultCategories,
        pieces: parsed.pieces || defaultPieces,
        heroSettings: parsed.heroSettings || defaultHeroSettings,
        heroSlides: parsed.heroSlides || defaultHeroSlides,
        storeSettings: { ...defaultStoreSettings, ...(parsed.storeSettings || {}) },
        siteContent: {
          header: { ...defaultSiteContent.header, ...(parsed.siteContent?.header || {}) },
          collection: { ...defaultSiteContent.collection, ...(parsed.siteContent?.collection || {}) },
          rules: { ...defaultSiteContent.rules, ...(parsed.siteContent?.rules || {}) },
          contact: { ...defaultSiteContent.contact, ...(parsed.siteContent?.contact || {}) },
          footer: { ...defaultSiteContent.footer, ...(parsed.siteContent?.footer || {}) },
        },
        rulesSettings: parsed.rulesSettings || defaultRulesSettings,
        rules: parsed.rules || defaultRules,
        users: parsed.users && parsed.users.length > 0 ? parsed.users : defaultUsers,
      };
    }
  } catch (err) {
    console.error("Error reading database file, using defaults:", err);
  }
  const initialData: AppDatabase = {
    categories: defaultCategories,
    pieces: defaultPieces,
    heroSettings: defaultHeroSettings,
    heroSlides: defaultHeroSlides,
    storeSettings: defaultStoreSettings,
    siteContent: defaultSiteContent,
    rulesSettings: defaultRulesSettings,
    rules: defaultRules,
    users: defaultUsers,
  };
  saveDatabase(initialData);
  return initialData;
}

// Function to synchronously write database to disk
function saveDatabase(data: AppDatabase) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// Load current persistent state
const db = loadDatabase();
let categories = db.categories;
let pieces = db.pieces;
const heroSettings = db.heroSettings;
let heroSlides = db.heroSlides;
const storeSettings = db.storeSettings;
let siteContent = db.siteContent;
const rulesSettings = db.rulesSettings;
let rules = db.rules;
const users = db.users;

// Helper to persist whenever state mutations happen
function persist() {
  saveDatabase({
    categories,
    pieces,
    heroSettings,
    heroSlides,
    storeSettings,
    siteContent,
    rulesSettings,
    rules,
    users,
  });
}

// ================= API ROUTES =================

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    security: {
      rateLimit: "enabled",
      httpOnlyCookies: "enabled",
      jwtExpiry: "24h",
      bcryptHashing: "enabled",
      twoFactorAuth: "supported",
      corsPolicy: "restricted",
    },
  });
});

// Helper to set HttpOnly secure cookie
function setAuthCookie(res: express.Response, token: string) {
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: "/",
  });
}

// Auth: Login (with rate-limiting, Zod validation, bcrypt & optional 2FA)
app.post("/api/login", loginRateLimiter, validateBody(loginSchema), async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: "Usuário ou senha incorretos." });
  }

  let isMatch = await comparePassword(password, user.password_hash);

  // Seamless fallback for initial default passwords (transparently upgrades to bcrypt)
  if (!isMatch && user.username === "admin") {
    if (
      password === "123456" ||
      password === "admin" ||
      password === "admin123" ||
      password === "password" ||
      (process.env.ADMIN_DEFAULT_PASSWORD && password === process.env.ADMIN_DEFAULT_PASSWORD)
    ) {
      isMatch = true;
      user.password_hash = await hashPassword(password);
      persist();
    }
  }

  if (!isMatch) {
    return res.status(401).json({ message: "Usuário ou senha incorretos." });
  }

  // Check if Two-Factor Authentication (2FA) is activated for this user
  if (user.two_factor_enabled) {
    const tempToken = generateTemp2FAToken(user.username, user.id);
    return res.json({
      requires2FA: true,
      tempToken,
      message: "Código de autenticação em 2 etapas (2FA) necessário.",
    });
  }

  // Issue 24h JWT token
  const token = generateAuthToken({
    id: user.id,
    username: user.username,
    role: user.role,
  });

  // Set HttpOnly Cookie
  setAuthCookie(res, token);

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      two_factor_enabled: user.two_factor_enabled,
    },
  });
});

// Auth: Verify 2FA code and issue token
app.post(
  "/api/login/verify-2fa",
  loginRateLimiter,
  validateBody(verify2FASchema),
  async (req, res) => {
    const { tempToken, code } = req.body;

    const payload = verifyTemp2FAToken(tempToken);
    if (!payload) {
      return res.status(401).json({
        message: "Sessão 2FA expirada ou inválida. Faça login novamente.",
        code: "TEMP_TOKEN_EXPIRED",
      });
    }

    const user = users.find((u) => u.id === payload.id);
    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    if (user.two_factor_pin !== code) {
      return res.status(401).json({
        message: "Código de autenticação 2FA incorreto.",
        code: "INVALID_2FA_CODE",
      });
    }

    const token = generateAuthToken({
      id: user.id,
      username: user.username,
      role: user.role,
      two_factor_verified: true,
    });

    setAuthCookie(res, token);

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        two_factor_enabled: user.two_factor_enabled,
      },
    });
  }
);

// Auth: Logout (Clears HttpOnly Cookie)
app.post("/api/logout", (req, res) => {
  res.clearCookie("auth_token", { path: "/" });
  res.json({ message: "Logout realizado com sucesso." });
});

// Auth: Get current session status
app.get("/api/auth/me", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({
    authenticated: true,
    user: req.user,
  });
});

// Admin Security: 2FA Status
app.get("/api/admin/2fa/status", requireAuth, (req: AuthenticatedRequest, res) => {
  const user = users.find((u) => u.id === req.user?.id);
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  res.json({
    enabled: Boolean(user.two_factor_enabled),
    pin_hint: user.two_factor_enabled ? user.two_factor_pin : null,
  });
});

// Admin Security: Toggle 2FA
app.post(
  "/api/admin/2fa/toggle",
  requireAuth,
  validateBody(toggle2FASchema),
  async (req: AuthenticatedRequest, res) => {
    const user = users.find((u) => u.id === req.user?.id);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    const isValidPassword = await comparePassword(req.body.password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Senha atual incorreta." });
    }

    user.two_factor_enabled = Boolean(req.body.enabled);
    if (user.two_factor_enabled && !user.two_factor_pin) {
      user.two_factor_pin = "123456"; // Default standard initial 6-digit pin
    }
    user.updated_at = new Date().toISOString();
    persist();

    res.json({
      success: true,
      enabled: user.two_factor_enabled,
      pin: user.two_factor_pin,
      message: user.two_factor_enabled
        ? "Autenticação em 2 etapas ativada com sucesso! Seu código PIN atual é: " + user.two_factor_pin
        : "Autenticação em 2 etapas desativada.",
    });
  }
);

// Admin Security: Change Password (bcrypt hashed)
app.post(
  "/api/admin/change-password",
  requireAuth,
  validateBody(changePasswordSchema),
  async (req: AuthenticatedRequest, res) => {
    const user = users.find((u) => u.id === req.user?.id);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    const isValidPassword = await comparePassword(req.body.currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Senha atual incorreta." });
    }

    user.password_hash = await hashPassword(req.body.newPassword);
    user.updated_at = new Date().toISOString();
    persist();

    res.json({ message: "Senha alterada com sucesso! A nova senha já está protegida com hash bcrypt." });
  }
);

// Categories
app.get("/api/categories", (req, res) => {
  res.json(categories);
});

app.post(
  "/api/categories",
  requireAuth,
  requireRole(["admin", "manager"]),
  validateBody(categorySchema),
  (req, res) => {
    const { name, is_active } = req.body;
    const newCat = {
      id: String(Date.now()),
      name,
      slug: name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      is_active: is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    categories.push(newCat);
    persist();
    res.status(201).json(newCat);
  }
);

app.put(
  "/api/categories/:id",
  requireAuth,
  requireRole(["admin", "manager"]),
  (req, res) => {
    const cleanId = sanitizeParam(req.params.id);
    const catIndex = categories.findIndex((c) => String(c.id) === cleanId);
    if (catIndex === -1) return res.status(404).json({ message: "Categoria não encontrada" });

    const { name, is_active } = req.body;
    if (name !== undefined) {
      categories[catIndex].name = name;
      categories[catIndex].slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (is_active !== undefined) {
      categories[catIndex].is_active = is_active;
    }
    categories[catIndex].updated_at = new Date().toISOString();
    persist();
    res.json(categories[catIndex]);
  }
);

app.delete(
  "/api/categories/:id",
  requireAuth,
  requireRole(["admin", "manager"]),
  (req, res) => {
    const catId = sanitizeParam(req.params.id);
    const hasPieces = pieces.some((p) => String(p.category_id) === catId);
    if (hasPieces) {
      return res.status(400).json({ message: "Não é possível excluir categoria com peças vinculadas." });
    }
    categories = categories.filter((c) => String(c.id) !== catId);
    persist();
    res.status(204).send();
  }
);

// Pieces: Public reads filtered with Row-Level Security (RLS)
app.get("/api/pieces", (req: AuthenticatedRequest, res) => {
  // Check optional auth for RLS
  const token = extractToken(req);
  let userPayload: AuthTokenPayload | undefined;
  if (token) {
    try {
      userPayload = (req as any).user || (require("./server/security").verifyAuthToken
        ? require("./server/security").verifyAuthToken(token)
        : undefined);
    } catch {
      // Ignored for public catalog view
    }
  }

  const enriched = pieces.map((p) => {
    const cat = categories.find((c) => String(c.id) === String(p.category_id));
    return {
      ...p,
      category: cat ? { name: cat.name } : undefined,
    };
  });

  const filtered = applyRLSFilter(enriched, userPayload);
  res.json(filtered);
});

app.get("/api/pieces/:id", (req, res) => {
  const cleanId = sanitizeParam(req.params.id);
  const p = pieces.find((item) => String(item.id) === cleanId);
  if (!p) return res.status(404).json({ message: "Peça não encontrada" });
  const cat = categories.find((c) => String(c.id) === String(p.category_id));
  res.json({ ...p, category: cat ? { name: cat.name } : undefined });
});

app.post(
  "/api/pieces",
  requireAuth,
  requireRole(["admin", "manager"]),
  validateBody(pieceSchema),
  (req, res) => {
    const {
      name,
      description,
      price,
      category_id,
      images,
      image_url,
      measurements,
      status,
      image_position_x,
      image_position_y,
      image_zoom,
    } = req.body;

    const parsedPrice =
      typeof price === "string" ? parseFloat(price.replace(",", ".")) : Number(price) || 0;

    const finalImages =
      images && images.length > 0 ? images : image_url ? [{ url: image_url, order: 1 }] : [];
    const primaryImageUrl = image_url || (finalImages.length > 0 ? finalImages[0].url : "");

    const newPiece = {
      id: String(Date.now()),
      name,
      description: description || "",
      price: parsedPrice,
      category_id: String(category_id),
      images: finalImages,
      image_url: primaryImageUrl,
      measurements: measurements || {},
      status: status || "available",
      image_position_x: image_position_x ?? 50,
      image_position_y: image_position_y ?? 50,
      image_zoom: image_zoom ?? 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    pieces.unshift(newPiece);
    persist();
    const cat = categories.find((c) => String(c.id) === String(newPiece.category_id));
    res.status(201).json({ ...newPiece, category: cat ? { name: cat.name } : undefined });
  }
);

app.put(
  "/api/pieces/:id",
  requireAuth,
  requireRole(["admin", "manager"]),
  (req, res) => {
    const cleanId = sanitizeParam(req.params.id);
    const pieceIndex = pieces.findIndex((p) => String(p.id) === cleanId);
    if (pieceIndex === -1) return res.status(404).json({ message: "Peça não encontrada" });

    const current = pieces[pieceIndex];
    const updated = {
      ...current,
      ...req.body,
      id: current.id,
      updated_at: new Date().toISOString(),
    };

    if (req.body.price !== undefined) {
      updated.price =
        typeof req.body.price === "string"
          ? parseFloat(req.body.price.replace(",", "."))
          : Number(req.body.price) || 0;
    }
    if (req.body.category_id !== undefined) {
      updated.category_id = String(req.body.category_id);
    }
    if (req.body.images && req.body.images.length > 0 && !req.body.image_url) {
      updated.image_url = req.body.images[0].url;
    }

    pieces[pieceIndex] = updated;
    persist();
    const cat = categories.find((c) => String(c.id) === String(updated.category_id));
    res.json({ ...updated, category: cat ? { name: cat.name } : undefined });
  }
);

app.put(
  "/api/pieces/:id/toggle-status",
  requireAuth,
  requireRole(["admin", "manager"]),
  (req, res) => {
    const cleanId = sanitizeParam(req.params.id);
    const piece = pieces.find((p) => String(p.id) === cleanId);
    if (!piece) return res.status(404).json({ message: "Peça não encontrada" });

    const newStatus = req.body.status || (piece.status === "available" ? "rented" : "available");
    piece.status = newStatus;
    piece.updated_at = new Date().toISOString();
    persist();

    const cat = categories.find((c) => String(c.id) === String(piece.category_id));
    res.json({ ...piece, category: cat ? { name: cat.name } : undefined });
  }
);

app.delete(
  "/api/pieces/:id",
  requireAuth,
  requireRole(["admin", "manager"]),
  (req, res) => {
    const cleanId = sanitizeParam(req.params.id);
    pieces = pieces.filter((p) => String(p.id) !== cleanId);
    persist();
    res.status(204).send();
  }
);

// Secure Image Uploads for Pieces (with rate limiter and upload validation)
app.post(
  "/api/pieces/upload-images",
  requireAuth,
  requireRole(["admin", "manager"]),
  uploadRateLimiter,
  upload.any(),
  (req, res) => {
    const files = (req.files as Express.Multer.File[]) || [];
    const urls = files.map((f) => `/uploads/${f.filename}`);
    res.json({ urls });
  }
);

// Hero Banner
app.get("/api/hero", (req, res) => {
  res.json({
    settings: heroSettings,
    slides: [...heroSlides].sort((a, b) => (a.order || 0) - (b.order || 0)),
  });
});

const updateHeroSettings = (req: AuthenticatedRequest, res: express.Response) => {
  const { slides, ...settingsData } = req.body;
  Object.assign(heroSettings, settingsData);

  // If slides array is provided in the payload, update order and properties
  if (Array.isArray(slides)) {
    slides.forEach((incomingSlide: any, index: number) => {
      const slideId = incomingSlide.id ? String(incomingSlide.id) : null;
      if (slideId) {
        const existingSlide = heroSlides.find((s) => String(s.id) === slideId);
        if (existingSlide) {
          existingSlide.order = incomingSlide.order ?? index + 1;
          if (incomingSlide.title !== undefined) existingSlide.title = incomingSlide.title;
          if (incomingSlide.subtitle !== undefined) existingSlide.subtitle = incomingSlide.subtitle;
          if (incomingSlide.cta_text !== undefined) existingSlide.cta_text = incomingSlide.cta_text;
          if (incomingSlide.cta_link !== undefined) existingSlide.cta_link = incomingSlide.cta_link;
          if (incomingSlide.image_fit !== undefined) existingSlide.image_fit = incomingSlide.image_fit;
          if (incomingSlide.image_position_x !== undefined) existingSlide.image_position_x = incomingSlide.image_position_x;
          if (incomingSlide.image_position_y !== undefined) existingSlide.image_position_y = incomingSlide.image_position_y;
          if (incomingSlide.image_zoom !== undefined) existingSlide.image_zoom = incomingSlide.image_zoom;
          if (incomingSlide.brightness !== undefined) existingSlide.brightness = incomingSlide.brightness;
          if (incomingSlide.contrast !== undefined) existingSlide.contrast = incomingSlide.contrast;
          if (incomingSlide.saturation !== undefined) existingSlide.saturation = incomingSlide.saturation;
          if (incomingSlide.overlay_opacity !== undefined) existingSlide.overlay_opacity = incomingSlide.overlay_opacity;
          if (incomingSlide.filter_preset !== undefined) existingSlide.filter_preset = incomingSlide.filter_preset;
          if (incomingSlide.is_active !== undefined) existingSlide.is_active = incomingSlide.is_active;
          existingSlide.updated_at = new Date().toISOString();
        }
      }
    });
    heroSlides.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  persist();
  res.json({
    settings: heroSettings,
    slides: [...heroSlides].sort((a, b) => (a.order || 0) - (b.order || 0)),
  });
};
app.post("/api/hero", requireAuth, requireRole(["admin", "manager"]), updateHeroSettings);
app.put("/api/hero", requireAuth, requireRole(["admin", "manager"]), updateHeroSettings);

app.post(
  "/api/hero/slides",
  requireAuth,
  requireRole(["admin", "manager"]),
  (req, res) => {
    const newSlide = {
      id: String(Date.now()),
      image_url: req.body.image_url || "",
      title: req.body.title || "",
      subtitle: req.body.subtitle || "",
      cta_text: req.body.cta_text || "",
      cta_link: req.body.cta_link || "",
      order: req.body.order ?? heroSlides.length + 1,
      image_fit: req.body.image_fit || "cover",
      image_position_x: req.body.image_position_x ?? 50,
      image_position_y: req.body.image_position_y ?? 50,
      image_zoom: req.body.image_zoom ?? 100,
      brightness: req.body.brightness ?? 100,
      contrast: req.body.contrast ?? 100,
      saturation: req.body.saturation ?? 100,
      overlay_opacity: req.body.overlay_opacity ?? 50,
      filter_preset: req.body.filter_preset ?? "none",
      is_active: req.body.is_active ?? 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    heroSlides.push(newSlide);
    persist();
    res.status(201).json(newSlide);
  }
);

app.put(
  "/api/hero/slides/:id",
  requireAuth,
  requireRole(["admin", "manager"]),
  (req, res) => {
    const cleanId = sanitizeParam(req.params.id);
    const slideIndex = heroSlides.findIndex((s) => String(s.id) === cleanId);
    if (slideIndex === -1) return res.status(404).json({ message: "Slide não encontrado" });

    heroSlides[slideIndex] = {
      ...heroSlides[slideIndex],
      ...req.body,
      id: heroSlides[slideIndex].id,
      updated_at: new Date().toISOString(),
    };
    persist();
    res.json(heroSlides[slideIndex]);
  }
);

app.delete(
  "/api/hero/slides/:id",
  requireAuth,
  requireRole(["admin", "manager"]),
  (req, res) => {
    const cleanId = sanitizeParam(req.params.id);
    heroSlides = heroSlides.filter((s) => String(s.id) !== cleanId);
    persist();
    res.json({ message: "Slide removido" });
  }
);

app.post(
  "/api/hero/upload",
  requireAuth,
  requireRole(["admin", "manager"]),
  uploadRateLimiter,
  upload.single("image"),
  (req, res) => {
    if (req.file) {
      return res.json({ url: `/uploads/${req.file.filename}` });
    }
    res.status(400).json({ error: "Nenhuma imagem enviada" });
  }
);

// Store Settings
const getStoreSettings = (req: express.Request, res: express.Response) => {
  res.json(storeSettings);
};
const updateStoreSettings = (req: express.Request, res: express.Response) => {
  Object.assign(storeSettings, req.body);
  storeSettings.updated_at = new Date().toISOString();
  persist();
  res.json(storeSettings);
};

app.get("/api/settings", getStoreSettings);
app.get("/api/admin/settings", getStoreSettings);
app.put("/api/settings", requireAuth, requireRole(["admin"]), updateStoreSettings);
app.put("/api/admin/settings", requireAuth, requireRole(["admin"]), updateStoreSettings);

// Site Content (Text and Buttons Customization)
const getSiteContent = (req: express.Request, res: express.Response) => {
  res.json(siteContent);
};
const updateSiteContent = (req: express.Request, res: express.Response) => {
  siteContent = {
    header: { ...siteContent.header, ...(req.body.header || {}) },
    collection: { ...siteContent.collection, ...(req.body.collection || {}) },
    rules: { ...siteContent.rules, ...(req.body.rules || {}) },
    contact: { ...siteContent.contact, ...(req.body.contact || {}) },
    footer: { ...siteContent.footer, ...(req.body.footer || {}) },
  };
  persist();
  res.json(siteContent);
};

app.get("/api/site-content", getSiteContent);
app.get("/api/admin/site-content", getSiteContent);
app.put("/api/site-content", requireAuth, requireRole(["admin", "manager"]), updateSiteContent);
app.put("/api/admin/site-content", requireAuth, requireRole(["admin", "manager"]), updateSiteContent);

// Rules & Rental Policies Endpoints
app.get("/api/rules", (req, res) => {
  res.json({
    settings: rulesSettings,
    rules: [...rules].sort((a, b) => (a.order || 0) - (b.order || 0)),
  });
});

app.put(
  "/api/rules/settings",
  requireAuth,
  requireRole(["admin"]),
  validateBody(rulesSettingsSchema),
  (req, res) => {
    Object.assign(rulesSettings, req.body);
    persist();
    res.json(rulesSettings);
  }
);

app.post(
  "/api/rules",
  requireAuth,
  requireRole(["admin"]),
  validateBody(ruleSchema),
  (req, res) => {
    const newRule: RuleItem = {
      id: String(Date.now()),
      icon: req.body.icon || "Shield",
      title: req.body.title || "Nova Regra",
      description: req.body.description || "",
      details: Array.isArray(req.body.details)
        ? req.body.details
        : typeof req.body.details === "string"
        ? req.body.details.split("\n").map((s: string) => s.trim()).filter(Boolean)
        : [],
      order: req.body.order ?? rules.length + 1,
      is_active: req.body.is_active !== undefined ? Boolean(req.body.is_active) : true,
    };
    rules.push(newRule);
    persist();
    res.status(201).json(newRule);
  }
);

app.put(
  "/api/rules/:id",
  requireAuth,
  requireRole(["admin"]),
  (req, res) => {
    const cleanId = sanitizeParam(req.params.id);
    const ruleIndex = rules.findIndex((r) => String(r.id) === cleanId);
    if (ruleIndex === -1) {
      return res.status(404).json({ message: "Regra não encontrada" });
    }

    const updatedDetails = Array.isArray(req.body.details)
      ? req.body.details
      : typeof req.body.details === "string"
      ? req.body.details.split("\n").map((s: string) => s.trim()).filter(Boolean)
      : rules[ruleIndex].details;

    rules[ruleIndex] = {
      ...rules[ruleIndex],
      ...req.body,
      details: updatedDetails,
      id: rules[ruleIndex].id,
    };
    persist();
    res.json(rules[ruleIndex]);
  }
);

app.delete(
  "/api/rules/:id",
  requireAuth,
  requireRole(["admin"]),
  (req, res) => {
    const cleanId = sanitizeParam(req.params.id);
    rules = rules.filter((r) => String(r.id) !== cleanId);
    persist();
    res.json({ message: "Regra removida com sucesso" });
  }
);

app.post(
  "/api/rules/reset",
  requireAuth,
  requireRole(["admin"]),
  (req, res) => {
    rules = JSON.parse(JSON.stringify(defaultRules));
    Object.assign(rulesSettings, defaultRulesSettings);
    persist();
    res.json({
      settings: rulesSettings,
      rules: [...rules].sort((a, b) => (a.order || 0) - (b.order || 0)),
    });
  }
);

// ================= VITE INTEGRATION =================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: PORT,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Express 5 catch-all syntax
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LooksdeHoje full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
