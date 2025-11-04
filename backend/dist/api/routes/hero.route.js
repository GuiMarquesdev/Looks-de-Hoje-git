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
            const { settings, slides } = await heroService.getSettingsAndSlides();
            if (!settings) {
                return res.json(DEFAULT_HERO_SETTINGS);
            }
            return res.json({ settings, slides });
        }
        catch (error) {
            console.error("Error fetching hero settings:", error);
            return res
                .status(500)
                .json({ message: "Erro interno ao buscar configurações do Hero." });
        }
    };
    router
        .route("/")
        .get(handleGetHeroSettings) // GET /api/hero
        .put(async (req, res) => {
        // PUT /api/hero
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
    // ======================================================================
    // NOVAS ROTAS PARA GERENCIAMENTO DE SLIDES
    // ======================================================================
    // POST /api/hero/slides - Adiciona um novo slide
    router.post("/slides", async (req, res) => {
        try {
            const { image_url, title, subtitle, cta_text, cta_link, image_fit, image_position_x, image_position_y, image_zoom, } = req.body;
            if (!image_url) {
                return res
                    .status(400)
                    .json({ message: "image_url é obrigatório para um novo slide." });
            }
            const { settings, slides } = await heroService.getSettingsAndSlides();
            const currentSettings = settings || DEFAULT_HERO_SETTINGS.settings;
            const currentSlides = slides || [];
            // Gera um ID temporário/único para o slide (necessário para o Front-end)
            const newSlideId = Date.now().toString();
            const newSlide = {
                id: newSlideId,
                image_url,
                order: currentSlides.length + 1, // Garante que a ordem é o próximo número
                title: title || "",
                subtitle: subtitle || "",
                cta_text: cta_text || "",
                cta_link: cta_link || "",
                image_fit: image_fit || "cover",
                image_position_x: image_position_x !== undefined ? image_position_x : 50,
                image_position_y: image_position_y !== undefined ? image_position_y : 50,
                image_zoom: image_zoom !== undefined ? image_zoom : 100,
            };
            const updatedSlides = [...currentSlides, newSlide];
            // Reutiliza o updateHeroData do repositório
            const updatedHero = await heroSettingRepository.updateHeroData({
                ...currentSettings,
                slides: updatedSlides,
            });
            // Retorna o novo slide (com o ID) e o HeroSetting atualizado
            return res.status(201).json({ slide: newSlide, updatedHero });
        }
        catch (error) {
            console.error("Error creating new slide:", error);
            return res
                .status(500)
                .json({ message: "Erro interno ao criar novo slide." });
        }
    });
    // PUT /api/hero/slides/:id - Atualiza um slide existente
    router.put("/slides/:id", async (req, res) => {
        try {
            const slideId = req.params.id;
            const updateData = req.body;
            const { settings, slides } = await heroService.getSettingsAndSlides();
            if (!settings) {
                return res
                    .status(404)
                    .json({ message: "Configurações do Hero não encontradas." });
            }
            const currentSlides = slides || [];
            let slideFound = false;
            const updatedSlides = currentSlides.map((slide) => {
                if (slide.id === slideId) {
                    slideFound = true;
                    // Mescla os dados existentes com os novos
                    return { ...slide, ...updateData };
                }
                return slide;
            });
            if (!slideFound) {
                return res.status(404).json({ message: "Slide não encontrado." });
            }
            // Reutiliza o updateHeroData do repositório
            const updatedHero = await heroSettingRepository.updateHeroData({
                ...settings,
                slides: updatedSlides,
            });
            return res.status(200).json(updatedHero);
        }
        catch (error) {
            console.error("Error updating slide:", error);
            return res
                .status(500)
                .json({ message: "Erro interno ao atualizar slide." });
        }
    });
    // DELETE /api/hero/slides/:id - Remove um slide existente
    router.delete("/slides/:id", async (req, res) => {
        try {
            const slideId = req.params.id;
            const { settings, slides } = await heroService.getSettingsAndSlides();
            if (!settings) {
                return res
                    .status(404)
                    .json({ message: "Configurações do Hero não encontradas." });
            }
            const currentSlides = slides || [];
            const initialLength = currentSlides.length;
            // Filtra o slide a ser removido
            const remainingSlides = currentSlides.filter((slide) => slide.id !== slideId);
            if (remainingSlides.length === initialLength) {
                return res.status(404).json({ message: "Slide não encontrado." });
            }
            // Reordenar os slides restantes
            const reorderedSlides = remainingSlides.map((slide, index) => ({
                ...slide,
                order: index + 1, // Reordenar de 1 em diante
            }));
            // Reutiliza o updateHeroData do repositório
            const updatedHero = await heroSettingRepository.updateHeroData({
                ...settings,
                slides: reorderedSlides,
            });
            return res.status(200).json(updatedHero);
        }
        catch (error) {
            console.error("Error deleting slide:", error);
            return res
                .status(500)
                .json({ message: "Erro interno ao deletar slide." });
        }
    });
    return router;
};
exports.createHeroRouter = createHeroRouter;
//# sourceMappingURL=hero.route.js.map