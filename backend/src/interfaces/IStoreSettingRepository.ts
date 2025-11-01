// backend/src/interfaces/IStoreSettingRepository.ts

import { StoreSetting } from "@prisma/client";
import { StoreSettingsDTO } from "../common/types";

// Interface para o repositório de configurações da loja
export interface IStoreSettingRepository {
  getSettings(): Promise<StoreSetting | null>;

  updateStoreInfo(data: Partial<StoreSettingsDTO>): Promise<StoreSetting>;

  // 🚨 MÉTODO updateAdminPassword REMOVIDO 🚨
}
