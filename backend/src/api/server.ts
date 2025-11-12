// backend/src/api/server.ts

import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { PrismaRepositoryFactory } from "../factories/PrismaRepositoryFactory";
import { createAdminRoutes } from "./routes/admin.route";
import { createPiecesRoutes } from "./routes/pieces.route";
import { createHeroRouter } from "./routes/hero.route";
import { createCategoryRoutes } from "./routes/categories.route";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();
// ✅ CORREÇÃO: O argumento 'prisma' é passado para o construtor.
const repositoryFactory = new PrismaRepositoryFactory(prisma);

// Configurações do Middleware
app.use(cors());
app.use(express.json());

// =========================================================================
// CAMINHO CORRETO CONFIRMADO PELO LOG: '../..'
// =========================================================================
const UPLOADS_PATH = path.join(__dirname, "../..", "uploads");
console.log(`🚀 [DEBUG UPLOADS] Servindo arquivos de: ${UPLOADS_PATH}`); // Mantém o log para referência

app.use("/uploads", express.static(UPLOADS_PATH));
// =========================================================================
// FIM CAMINHO CORRETO
// =========================================================================

const adminRouter = createAdminRoutes(repositoryFactory);
const piecesRouter = createPiecesRoutes(repositoryFactory);
const heroRouter = createHeroRouter(repositoryFactory);
const categoryRouter = createCategoryRoutes(repositoryFactory); // INICIALIZAÇÃO

// Conexão das Rotas da API
app.use("/api/admin", adminRouter);
app.use("/api/pieces", piecesRouter);
app.use("/api/hero", heroRouter);
app.use("/api/categories", categoryRouter); // CONEXÃO DA ROTA

// Rota de Teste Simples
app.get("/api", (req, res) => {
  res.json({ message: "API Look de Hoje está online!" });
});

// Tratamento de Erros
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Algo deu errado no servidor!" });
  }
);

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// Tratamento de Encerramento (mantido)
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
