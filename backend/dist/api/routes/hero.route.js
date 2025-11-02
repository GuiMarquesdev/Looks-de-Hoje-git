"use strict";
// backend/src/api/routes/hero.route.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHeroRouter = void 0;
const express_1 = require("express");
const HeroService_1 = require("../../services/HeroService");
const createHeroRouter = (repositoryFactory) => {
    const router = (0, express_1.Router)();
    const heroSettingRepository = repositoryFactory.createHeroSettingRepository();
    const heroService = new HeroService_1.HeroService(heroSettingRepository);
    // Objeto de retorno padrão para quando as configurações não existirem no DB
    const DEFAULT_HERO_SETTINGS = {
        settings: {
            id: "hero", // ID padrão para o upsert
            is_active: true,
            interval_ms: 5000,
            background_image_url: "",
            title: "",
            subtitle: "",
            cta_text: "",
            cta_link: "",
        },
        slides: [],
    };
    // Lógica unificada para GET /api/hero
    const handleGetHeroSettings = async (req, res) => {
        try {
            // O HeroService buscará as configurações e slides
            const { settings, slides } = await heroService.getSettingsAndSlides();
            // **CORREÇÃO:** Se 'settings' for null ou undefined (primeiro acesso),
            // retorna o objeto padrão com status 200 OK, permitindo que o Admin
            // carregue e prepare a criação do registro via PUT (upsert).
            if (!settings) {
                return res.json(DEFAULT_HERO_SETTINGS);
            }
            // Retorna a combinação de configurações e slides encontrados
            return res.json({ settings, slides });
        }
        catch (error) {
            console.error("Error fetching hero settings:", error);
            // Erro 500 para falhas de servidor/banco de dados
            return res
                .status(500)
                .json({ message: "Erro interno ao buscar configurações do Hero." });
        }
    };
    router
        .route("/")
        .get(handleGetHeroSettings) // Aplica a correção no GET
        .put(async (req, res) => {
        // ... O código PUT/upsert deve permanecer o mesmo ...
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