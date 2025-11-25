// backend/src/interfaces/IStoreSettingRepository.ts

import { StoreSetting } from "@prisma/client";
import { StoreSettingsDTO } from "../common/types";

// ✅ CORREÇÃO: A interface só deve declarar os métodos de negócio necessários.
// Isso evita a importação acidental de métodos CRUD como 'findUnique' ou 'update'.
export interface IStoreSettingRepository {
  getSettings(): Promise<StoreSetting | null>;

  updateStoreInfo(data: Partial<StoreSettingsDTO>): Promise<StoreSetting>;
}
