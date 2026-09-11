import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import multer from "multer";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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

// Serve uploaded assets
app.use("/uploads", express.static(uploadsDir));
app.use("/storage/uploads", express.static(uploadsDir));
app.use("/storage/hero-slides", express.static(uploadsDir));

// Multer storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

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
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Database schema container
interface AppDatabase {
  categories: typeof defaultCategories;
  pieces: typeof defaultPieces;
  heroSettings: typeof defaultHeroSettings;
  heroSlides: typeof defaultHeroSlides;
  storeSettings: typeof defaultStoreSettings;
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
        storeSettings: parsed.storeSettings || defaultStoreSettings,
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
let heroSettings = db.heroSettings;
let heroSlides = db.heroSlides;
let storeSettings = db.storeSettings;

// Helper to persist whenever state mutations happen
function persist() {
  saveDatabase({
    categories,
    pieces,
    heroSettings,
    heroSlides,
    storeSettings,
  });
}

// ================= API ROUTES =================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Auth
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Usuário e senha são obrigatórios" });
  }

  // Accepts standard default credentials (admin / 123456 or admin / admin)
  if (
    username === "admin" &&
    (password === "123456" || password === "admin" || password === "password")
  ) {
    const token = "admin-session-token-" + Date.now();
    return res.json({
      token,
      user: {
        id: 1,
        username: "admin",
      },
    });
  }

  return res.status(401).json({ message: "Credenciais inválidas" });
});

app.post("/api/logout", (req, res) => {
  res.json({ message: "Logout realizado com sucesso" });
});

// Categories
app.get("/api/categories", (req, res) => {
  res.json(categories);
});

app.post("/api/categories", (req, res) => {
  const { name, is_active } = req.body;
  if (!name) return res.status(422).json({ message: "Nome é obrigatório" });
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
  res.status(201).json(newCat);
});

app.put("/api/categories/:id", (req, res) => {
  const catIndex = categories.findIndex((c) => String(c.id) === String(req.params.id));
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
  res.json(categories[catIndex]);
});

app.delete("/api/categories/:id", (req, res) => {
  const catId = String(req.params.id);
  const hasPieces = pieces.some((p) => String(p.category_id) === catId);
  if (hasPieces) {
    return res.status(400).json({ message: "Não é possível excluir categoria com peças vinculadas." });
  }
  categories = categories.filter((c) => String(c.id) !== catId);
  res.status(204).send();
});

// Pieces
app.get("/api/pieces", (req, res) => {
  const enriched = pieces.map((p) => {
    const cat = categories.find((c) => String(c.id) === String(p.category_id));
    return {
      ...p,
      category: cat ? { name: cat.name } : undefined,
    };
  });
  res.json(enriched);
});

app.get("/api/pieces/:id", (req, res) => {
  const p = pieces.find((item) => String(item.id) === String(req.params.id));
  if (!p) return res.status(404).json({ message: "Peça não encontrada" });
  const cat = categories.find((c) => String(c.id) === String(p.category_id));
  res.json({ ...p, category: cat ? { name: cat.name } : undefined });
});

app.post("/api/pieces", (req, res) => {
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

  if (!name) return res.status(422).json({ message: "Nome é obrigatório" });

  const parsedPrice =
    typeof price === "string" ? parseFloat(price.replace(",", ".")) : Number(price) || 0;

  const finalImages = images && images.length > 0 ? images : image_url ? [{ url: image_url, order: 1 }] : [];
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
  const cat = categories.find((c) => String(c.id) === String(newPiece.category_id));
  res.status(201).json({ ...newPiece, category: cat ? { name: cat.name } : undefined });
});

app.put("/api/pieces/:id", (req, res) => {
  const pieceIndex = pieces.findIndex((p) => String(p.id) === String(req.params.id));
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
  const cat = categories.find((c) => String(c.id) === String(updated.category_id));
  res.json({ ...updated, category: cat ? { name: cat.name } : undefined });
});

app.put("/api/pieces/:id/toggle-status", (req, res) => {
  const piece = pieces.find((p) => String(p.id) === String(req.params.id));
  if (!piece) return res.status(404).json({ message: "Peça não encontrada" });

  const newStatus = req.body.status || (piece.status === "available" ? "rented" : "available");
  piece.status = newStatus;
  piece.updated_at = new Date().toISOString();

  const cat = categories.find((c) => String(c.id) === String(piece.category_id));
  res.json({ ...piece, category: cat ? { name: cat.name } : undefined });
});

app.delete("/api/pieces/:id", (req, res) => {
  pieces = pieces.filter((p) => String(p.id) !== String(req.params.id));
  res.status(204).send();
});

// Image Uploads for Pieces
app.post("/api/pieces/upload-images", upload.any(), (req, res) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const urls = files.map((f) => `/uploads/${f.filename}`);
  res.json({ urls });
});

// Hero Banner
app.get("/api/hero", (req, res) => {
  res.json({
    settings: heroSettings,
    slides: [...heroSlides].sort((a, b) => (a.order || 0) - (b.order || 0)),
  });
});

const updateHeroSettings = (req: express.Request, res: express.Response) => {
  Object.assign(heroSettings, req.body);
  res.json(heroSettings);
};
app.post("/api/hero", updateHeroSettings);
app.put("/api/hero", updateHeroSettings);

app.post("/api/hero/slides", (req, res) => {
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
    is_active: req.body.is_active ?? 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  heroSlides.push(newSlide);
  res.status(201).json(newSlide);
});

app.put("/api/hero/slides/:id", (req, res) => {
  const slideIndex = heroSlides.findIndex((s) => String(s.id) === String(req.params.id));
  if (slideIndex === -1) return res.status(404).json({ message: "Slide não encontrado" });

  heroSlides[slideIndex] = {
    ...heroSlides[slideIndex],
    ...req.body,
    id: heroSlides[slideIndex].id,
    updated_at: new Date().toISOString(),
  };
  res.json(heroSlides[slideIndex]);
});

app.delete("/api/hero/slides/:id", (req, res) => {
  heroSlides = heroSlides.filter((s) => String(s.id) !== String(req.params.id));
  res.json({ message: "Slide removido" });
});

app.post("/api/hero/upload", upload.single("image"), (req, res) => {
  if (req.file) {
    return res.json({ url: `/uploads/${req.file.filename}` });
  }
  res.status(400).json({ error: "Nenhuma imagem enviada" });
});

// Store Settings
const getStoreSettings = (req: express.Request, res: express.Response) => {
  res.json(storeSettings);
};
const updateStoreSettings = (req: express.Request, res: express.Response) => {
  Object.assign(storeSettings, req.body);
  storeSettings.updated_at = new Date().toISOString();
  res.json(storeSettings);
};

app.get("/api/settings", getStoreSettings);
app.get("/api/admin/settings", getStoreSettings);
app.put("/api/settings", updateStoreSettings);
app.put("/api/admin/settings", updateStoreSettings);

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
