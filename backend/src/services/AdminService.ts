// backend/src/services/AdminService.ts (Versão Refatorada para Sem Login)

import { StoreSetting } from "@prisma/client";
import { IAdminService } from "../interfaces/IAdminService";
import { IStoreSettingRepository } from "../interfaces/IStoreSettingRepository";
// import { IAdminCredentialsRepository } from "../interfaces/IAdminCredentialsRepository"; // <-- REMOVIDO
import { StoreSettingsDTO } from "../common/types";

// As variáveis de ambiente não são mais necessárias para autenticação
// const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_insecure"; // <-- REMOVIDO
// const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@exemplo.com"; // <-- REMOVIDO

export class AdminService implements IAdminService {
  constructor(
    private storeSettingRepository: IStoreSettingRepository // private adminCredentialsRepository: IAdminCredentialsRepository // <-- REMOVIDO
  ) {}
  login(
    email: string,
    password: string
  ): Promise<{
    token: string;
    user: { id: string; email: string; store_name: string };
  }> {
    throw new Error("Method not implemented.");
  }
  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  // 1. O Login foi REMOVIDO.

  // 2. Implementação do GET Settings (CORRIGIDO: Apenas StoreSetting)
  async getSettings(): Promise<Partial<StoreSetting> | null> {
    const settings = await this.storeSettingRepository.getSettings();
    if (settings) {
      return settings;
    }
    return null;
  }

  // 3. Implementação do Update Store Info (CORRIGIDO: Apenas StoreSetting)
  async updateStoreInfo(
    data: Partial<StoreSettingsDTO>
  ): Promise<StoreSetting> {
    if (!data.store_name) {
      throw new Error("O nome da loja é obrigatório.");
    }
    return this.storeSettingRepository.updateStoreInfo(data);
  }

  // 4. O Change Password foi REMOVIDO.
}

// **Ações Adicionais:** Você precisa remover 'login' e 'changePassword' da interface IAdminService
// E remover todas as importações de IAdminCredentialsRepository
