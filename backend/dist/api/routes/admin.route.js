"use strict";
// backend/src/api/routes/admin.route.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminRoutes = void 0;
const express_1 = require("express");
const AdminService_1 = require("../../services/AdminService");
const createAdminRoutes = (repositoryFactory) => {
    const router = (0, express_1.Router)();
    const storeSettingRepository = repositoryFactory.createStoreSettingRepository();
    const adminService = new AdminService_1.AdminService(storeSettingRepository);
    // ROTA GET /api/admin/settings (ACESSO DIRETO AGORA)
    router.get("/settings", async (req, res) => {
        try {
            const settings = await adminService.getSettings();
            if (!settings) {
                return res.json({});
            }
            return res.json(settings);
        }
        catch (error) {
            console.error("Error fetching admin settings:", error);
            return res
                .status(500)
                .json({ message: "Erro ao buscar configurações da loja." });
        }
    });
    // ROTA PUT /api/admin/settings (ACESSO DIRETO AGORA)
    router.put("/settings", async (req, res) => {
        try {
            const updateData = req.body;
            const payload = {
                store_name: updateData.store_name,
                instagram_url: updateData.instagram_url,
                whatsapp_url: updateData.whatsapp_url,
                email: updateData.email,
            };
            const updatedSettings = await adminService.updateStoreInfo(payload);
            return res.json(updatedSettings);
        }
        catch (error) {
            console.error("Error updating admin settings:", error);
            return res.status(400).json({
                message: error.message || "Erro ao atualizar configurações da loja.",
            });
        }
    });
    // ROTA PUT /api/admin/password (Rota desabilitada)
    router.put("/password", async (req, res) => {
        return res.status(400).json({
            message: "A alteração de senha foi desabilitada, pois o login foi removido.",
        });
    });
    return router;
};
exports.createAdminRoutes = createAdminRoutes;
//# sourceMappingURL=admin.route.js.map