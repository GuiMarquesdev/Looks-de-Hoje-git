// backend/src/api/routes/admin.route.ts

import { Router, Request, Response } from "express";
import { IRepositoryFactory } from "../../factories/IRepositoryFactory";
import { AdminService } from "../../services/AdminService";
import { StoreSettingsDTO } from "../../common/types";

export const createAdminRoutes = (repositoryFactory: IRepositoryFactory) => {
  const router = Router();
  const storeSettingRepository =
    repositoryFactory.createStoreSettingRepository();

  const adminService = new AdminService(storeSettingRepository);

  // ROTA GET /api/admin/settings (ACESSO DIRETO AGORA)
  router.get("/settings", async (req: Request, res: Response) => {
    try {
      const settings = await adminService.getSettings();
      if (!settings) {
        return res.json({});
      }
      return res.json(settings);
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar configurações da loja." });
    }
  });

  // ROTA PUT /api/admin/settings (ACESSO DIRETO AGORA)
  router.put("/settings", async (req: Request, res: Response) => {
    try {
      const updateData: Partial<StoreSettingsDTO> = req.body;
      const payload: Partial<StoreSettingsDTO> = {
        store_name: updateData.store_name,
        instagram_url: updateData.instagram_url,
        whatsapp_url: updateData.whatsapp_url,
        email: updateData.email,
      };

      const updatedSettings = await adminService.updateStoreInfo(payload);
      return res.json(updatedSettings);
    } catch (error: any) {
      console.error("Error updating admin settings:", error);
      return res.status(400).json({
        message: error.message || "Erro ao atualizar configurações da loja.",
      });
    }
  });

  // ROTA PUT /api/admin/password (Rota desabilitada)
  router.put("/password", async (req: Request, res: Response) => {
    return res.status(400).json({
      message:
        "A alteração de senha foi desabilitada, pois o login foi removido.",
    });
  });

  return router;
};
