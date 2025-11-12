// backend/src/interfaces/IAdminService.ts

import { StoreSetting } from "@prisma/client";
import { StoreSettingsDTO, AdminLoginDTO } from "../common/types"; // ✅ CORREÇÃO: Adiciona AdminLoginDTO

// NOVO TIPO: Define o resultado de um login bem-sucedido na nova implementação
export interface IAdminLoginResult {
  token: string;
  username: string;
}

// Interface que define os métodos que o AdminService deve implementar.
export interface IAdminService {
  // ✅ CORREÇÃO: Altera a assinatura para aceitar um único objeto AdminLoginDTO
  login(credentials: AdminLoginDTO): Promise<IAdminLoginResult | null>;

  // CORRIGIDO: Nome do método para getStoreSettings para corresponder ao AdminService.ts
  getStoreSettings(): Promise<StoreSetting | null>;

  // CORRIGIDO: Nome do método e tipo de parâmetro para corresponder ao AdminService.ts
  updateStoreSettings(settings: StoreSetting): Promise<StoreSetting>;

  // MANTIDO: O método changePassword que estava na interface original.
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
}
