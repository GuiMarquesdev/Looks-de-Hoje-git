// backend/src/interfaces/IAdminService.ts

import { StoreSetting } from "@prisma/client";
import { StoreSettingsDTO, AdminLoginDTO } from "../common/types";

// NOVO TIPO: Define o resultado de um login bem-sucedido na nova implementação
export interface IAdminLoginResult {
  token: string;
  username: string;
}

// Interface que define os métodos que o AdminService deve implementar.
export interface IAdminService {
  // ✅ CORREÇÃO: Assinatura para login
  login(credentials: AdminLoginDTO): Promise<IAdminLoginResult | null>;

  // Obtém as configurações da loja
  getStoreSettings(): Promise<StoreSetting | null>;

  // Atualiza as configurações da loja
  updateStoreSettings(settings: StoreSetting): Promise<StoreSetting>;

  
}
