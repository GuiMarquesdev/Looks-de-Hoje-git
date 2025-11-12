// backend/src/services/AdminService.ts

// ✅ CORREÇÃO: Importa IAdminLoginResult para usar no retorno
import { IAdminService, IAdminLoginResult } from "../interfaces/IAdminService";
import { AdminLoginDTO } from "../common/types";
import { IAdminCredentialsRepository } from "../interfaces/IAdminCredentialsRepository";
import { sign } from "jsonwebtoken";
// ✅ CORREÇÃO: Usa alias de caminho para o config
import { config } from "@/config";
// ✅ CORREÇÃO: Usa bcryptjs
import * as bcryptjs from "bcryptjs";
import { StoreSetting } from "@prisma/client";

export class AdminService implements IAdminService {
  constructor(
    private readonly adminCredentialsRepository: IAdminCredentialsRepository
  ) {}
  getStoreSettings(): Promise<StoreSetting | null> {
    throw new Error("Method not implemented.");
  }
  updateStoreSettings(settings: StoreSetting): Promise<StoreSetting> {
    throw new Error("Method not implemented.");
  }
  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

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
    // ✅ CORREÇÃO: Retorna null em caso de falha (conforme a nova assinatura)
    if (!admin) {
      return null;
    }

    // 3. Compara a senha fornecida com o hash armazenado
    const passwordMatch = await bcryptjs.compare(
      password,
      admin.admin_password
    );

    if (!passwordMatch) {
      // ✅ CORREÇÃO: Retorna null em caso de falha (conforme a nova assinatura)
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
  // (outros métodos do IAdminService precisam ser implementados aqui)
}
