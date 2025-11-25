// backend/src/services/AdminService.ts

import { IAdminService, IAdminLoginResult } from "../interfaces/IAdminService";
import { AdminLoginDTO } from "../common/types";
import { IAdminCredentialsRepository } from "../interfaces/IAdminCredentialsRepository";
import { IStoreSettingRepository } from "../interfaces/IStoreSettingRepository";
import { sign } from "jsonwebtoken";
import { config } from "@/config";
import * as bcryptjs from "bcryptjs";
import { StoreSetting } from "@prisma/client";

export class AdminService implements IAdminService {
  // ✅ CORREÇÃO: Adiciona storeSettingRepository ao constructor
  constructor(
    private readonly adminCredentialsRepository: IAdminCredentialsRepository,
    private readonly storeSettingRepository: IStoreSettingRepository
  ) {}

  // ✅ CORREÇÃO: Implementa getStoreSettings
  async getStoreSettings(): Promise<StoreSetting | null> {
    return this.storeSettingRepository.getSettings();
  }

  // ✅ CORREÇÃO: Implementa updateStoreSettings
  async updateStoreSettings(settings: StoreSetting): Promise<StoreSetting> {
    // Nota: updateStoreInfo em IStoreSettingRepository.ts espera Partial<StoreSettingsDTO>.
    // Estamos assumindo que `settings` (StoreSetting) é compatível para este uso.
    return this.storeSettingRepository.updateStoreInfo(settings as any);
  }

  // REMOVIDO: O método changePassword foi removido.

  // ✅ CORREÇÃO: Assinatura modificada para retornar Promise<IAdminLoginResult | null>
  async login({
    username,
    password,
  }: AdminLoginDTO): Promise<IAdminLoginResult | null> {
    // 1. Busca as credenciais de administrador pelo username/email fornecido
    const admin = await this.adminCredentialsRepository.findByUsername(
      username
    );

    // 2. Verifica se o administrador existe
    if (!admin) {
      return null;
    }

    // 3. Compara a senha fornecida com o hash armazenado
    const passwordMatch = await bcryptjs.compare(
      password,
      admin.admin_password
    );

    if (!passwordMatch) {
      return null;
    }

    // 4. Se as credenciais estiverem corretas, gera o token JWT
    const token = sign({ sub: admin.id, role: "admin" }, config.jwtSecret, {
      expiresIn: "7d",
    });

    // ✅ CORREÇÃO: Retorna o objeto IAdminLoginResult completo em caso de sucesso
    return {
      token,
      username: admin.username,
    };
  }
}
