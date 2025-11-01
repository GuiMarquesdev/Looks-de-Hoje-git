"use strict";
// backend/src/api/routes/hero.route.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHeroRouter = void 0;
const express_1 = require("express");
const HeroService_1 = require("../../services/HeroService");
const createHeroRouter = (repositoryFactory) => {
    const router = (0, express_1.Router)();
    const heroSettingRepository = repositoryFactory.createHeroSettingRepository();
    const heroService = new HeroService_1.HeroService(heroSettingRepository); // Assumindo injeção correta
    // 🚨 1. Lida com a URL vazia ("/") que o app.use envia
    router.get("/", async (_req, res) => {
        try {
            // Usando o serviço que criamos
            const { settings, slides } = await heroService.getSettingsAndSlides();
            if (!settings) {
                // Se o dado não existe, retornamos um 404 propositalmente, o que o Frontend está vendo
                return res.status(404).json({
                    message: "Configurações do Hero não inicializadas na base de dados.",
                });
            }
            // Retorna a combinação de configurações e slides
            return res.json({ settings, slides });
        }
        catch (error) {
            console.error("Error fetching hero settings:", error);
            // Erro 500 para falhas de servidor/banco de dados
            return res
                .status(500)
                .json({ message: "Erro interno ao buscar configurações do Hero." });
        }
    });
    // 🚨 CORREÇÃO: Use router.route("/") para garantir o registro do PUT
    router
        .route("/")
        .get(async (req, res) => {
        // Código da rota GET /api/hero (mantido)
        try {
            const { settings, slides } = await heroService.getSettingsAndSlides();
            if (!settings) {
                return res.status(404).json({
                    message: "Configurações do Hero não inicializadas na base de dados.",
                });
            }
            return res.json({ settings, slides });
        }
        catch (error) {
            console.error("Error fetching hero settings:", error);
            return res
                .status(500)
                .json({ message: "Erro interno ao buscar configurações do Hero." });
        }
    })
        .put(async (req, res) => {
        try {
            const updatePayload = req.body;
            if (!updatePayload.slides ||
                updatePayload.is_active === undefined ||
                updatePayload.interval_ms === undefined) {
                return res.status(400).json({
                    message: "Dados de configuração (slides, is_active e interval_ms) são obrigatórios.",
                });
            }
            const updatedHero = await heroSettingRepository.updateHeroData(updatePayload);
            return res.status(200).json(updatedHero);
        }
        catch (error) {
            console.error("Error updating hero settings:", error);
            return res.status(500).json({
                message: error.message || "Erro interno ao salvar configurações do Hero.",
            });
        }
    });
    return router;
};
exports.createHeroRouter = createHeroRouter;
//# sourceMappingURL=hero.route.js.map