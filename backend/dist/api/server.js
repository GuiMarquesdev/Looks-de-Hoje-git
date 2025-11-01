"use strict";
// backend/src/api/server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const PrismaRepositoryFactory_1 = require("../factories/PrismaRepositoryFactory");
const admin_route_1 = require("./routes/admin.route");
const pieces_route_1 = require("./routes/pieces.route");
const hero_route_1 = require("./routes/hero.route");
const categories_route_1 = require("./routes/categories.route");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const prisma = new client_1.PrismaClient();
const repositoryFactory = new PrismaRepositoryFactory_1.PrismaRepositoryFactory(prisma);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const adminRouter = (0, admin_route_1.createAdminRoutes)(repositoryFactory);
const piecesRouter = (0, pieces_route_1.createPiecesRoutes)(repositoryFactory);
const heroRouter = (0, hero_route_1.createHeroRouter)(repositoryFactory);
const categoryRouter = (0, categories_route_1.createCategoryRoutes)(repositoryFactory); // INICIALIZAÇÃO
app.use("/api/admin", adminRouter);
app.use("/api/pieces", piecesRouter);
app.use("/api/hero", heroRouter);
app.use("/api/categories", categoryRouter); // CONEXÃO DA ROTA
app.get("/api", (req, res) => {
    res.json({ message: "API Look de Hoje está online!" });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Algo deu errado no servidor!" });
});
const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
// Tratamento de Encerramento (mantido)
process.on("SIGTERM", () => {
    server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
});
process.on("SIGINT", () => {
    server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
});
//# sourceMappingURL=server.js.map