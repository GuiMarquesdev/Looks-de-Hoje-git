// backend/src/interfaces/IAdminService.ts

// CORRIGIDO: Importação do tipo StoreSetting no singular
import { StoreSetting } from "@prisma/client";
import { StoreSettingsDTO } from "../common/types";

// Interface que define os métodos que o AdminService deve implementar.
export interface IAdminService {
  login(
    email: string,
    password: string
  ): Promise<{
    token: string;
    user: { id: string; email: string; store_name: string };
  }>;

  // CORRIGIDO: Usando StoreSetting
  getSettings(): Promise<Partial<StoreSetting> | null>;

  // CORRIGIDO: Usando StoreSetting
  updateStoreInfo(data: Partial<StoreSettingsDTO>): Promise<StoreSetting>;

  changePassword(currentPassword: string, newPassword: string): Promise<void>;
}
