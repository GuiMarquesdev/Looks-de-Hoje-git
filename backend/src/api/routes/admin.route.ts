// admin.route.ts

import { Router, Request, Response } from "express";
import { AdminService } from "../../services/AdminService";
// 1. CORREÇÃO: Importa a interface para tipagem correta do argumento
import { IRepositoryFactory } from "../../factories/IRepositoryFactory";
import { authMiddleware } from "../middlewares/auth.middleware";

// ✅ CORREÇÃO: Reintroduz a função de fábrica nomeada 'createAdminRoutes'
export const createAdminRoutes = (repositoryFactory: IRepositoryFactory) => {
  // 2. CORREÇÃO: A instanciação de dependências é feita AGORA AQUI, usando o factory injetado.
  const adminCredentialsRepository =
    repositoryFactory.createAdminCredentialsRepository();
  const storeSettingRepository =
    repositoryFactory.createStoreSettingRepository();
  const adminService = new AdminService(
    adminCredentialsRepository,
    storeSettingRepository
  );

  const router = Router();

  // ===================================
  // 🔐 ROTA DE LOGIN (PÚBLICA)
  // ===================================
  router.post("/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    try {
      const result = await adminService.login(username, password);

      if (!result) {
        // Mensagem genérica para segurança
        return res.status(401).json({ message: "Invalid credentials." });
      }

      // Retorna o token e o nome de usuário
      res.json({
        token: result.token,
        username: result.username,
      });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Server error during login process." });
    }
  });

  // ===================================
  // 🛡️ APLICAÇÃO DO MIDDLEWARE DE AUTENTICAÇÃO
  // Todas as rotas abaixo desta linha exigirão um JWT válido
  // ===================================
  router.use(authMiddleware);

  // EXEMPLO DE ROTA PROTEGIDA: Obtém as configurações da loja
  router.get("/settings", async (req: Request, res: Response) => {
    try {
      const settings = await adminService.getStoreSettings();
      if (!settings) {
        return res.status(404).json({ message: "Store settings not found." });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error getting store settings:", error);
      res.status(500).json({ message: "Server error." });
    }
  });

  // EXEMPLO DE ROTA PROTEGIDA: Atualiza as configurações da loja
  router.put("/settings", async (req: Request, res: Response) => {
    const settings = req.body;
    try {
      const updatedSettings = await adminService.updateStoreSettings(settings);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating store settings:", error);
      res.status(500).json({ message: "Server error." });
    }
  });

  return router;
};
