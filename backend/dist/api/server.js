"use strict";
// backend/src/api/server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const PrismaRepositoryFactory_1 = require("../factories/PrismaRepositoryFactory");
const admin_route_1 = require("./routes/admin.route");
const pieces_route_1 = require("./routes/pieces.route");
const hero_route_1 = require("./routes/hero.route");
const categories_route_1 = require("./routes/categories.route");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const prisma = new client_1.PrismaClient();
const repositoryFactory = new PrismaRepositoryFactory_1.PrismaRepositoryFactory(prisma);
// Configurações do Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// =========================================================================
// CAMINHO CORRETO CONFIRMADO PELO LOG: '../..'
// =========================================================================
const UPLOADS_PATH = path_1.default.join(__dirname, "../..", "uploads");
console.log(`🚀 [DEBUG UPLOADS] Servindo arquivos de: ${UPLOADS_PATH}`); // Mantém o log para referência
app.use("/uploads", express_1.default.static(UPLOADS_PATH));
// =========================================================================
// FIM CAMINHO CORRETO
// =========================================================================
const adminRouter = (0, admin_route_1.createAdminRoutes)(repositoryFactory);
const piecesRouter = (0, pieces_route_1.createPiecesRoutes)(repositoryFactory);
const heroRouter = (0, hero_route_1.createHeroRouter)(repositoryFactory);
const categoryRouter = (0, categories_route_1.createCategoryRoutes)(repositoryFactory); // INICIALIZAÇÃO
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
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Algo deu errado no servidor!" });
});
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
//# sourceMappingURL=server.js.map