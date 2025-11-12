import { StoreSetting } from "@prisma/client";
import { IAdminService, IAdminLoginResult } from "../interfaces/IAdminService";
import { IAdminCredentialsRepository } from "../interfaces/IAdminCredentialsRepository";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { IStoreSettingRepository } from "../interfaces/IStoreSettingRepository";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  // Garante que a aplicação não inicie sem a chave de segurança
  throw new Error("JWT_SECRET is not defined.");
}

export class AdminService implements IAdminService {
  constructor(
    private adminCredentialsRepository: IAdminCredentialsRepository,
    private storeSettingRepository: IStoreSettingRepository
  ) {}

  // MÉTODO: Lógica de Login e Geração de JWT
  async login(
    username: string,
    passwordAttempt: string
  ): Promise<IAdminLoginResult | null> {
    // 1. Buscar credenciais
    const adminCredentials =
      await this.adminCredentialsRepository.findByUsername(username);

    if (!adminCredentials) {
      return null; // Usuário não encontrado
    }

    // 2. Comparar a senha
    const isPasswordValid = await bcrypt.compare(
      passwordAttempt,
      adminCredentials.admin_password // CORREÇÃO: Usando 'admin_password'
    );

    if (!isPasswordValid) {
      return null; // Senha inválida
    }

    // 3. Gerar o JWT (payload: id e username)
    const payload = {
      id: adminCredentials.id,
      username: adminCredentials.username,
    };

    // Token expira em 1 dia (1d). Ajuste se necessário.
    // CORREÇÃO: Usando '!' em JWT_SECRET
    const token = jwt.sign(payload, JWT_SECRET!, { expiresIn: "1d" });

    return { token, username: adminCredentials.username };
  }

  // Métodos de Store Settings (agora compatíveis com IStoreSettingRepository)
  async updateStoreSettings(settings: StoreSetting): Promise<StoreSetting> {
    return this.storeSettingRepository.update(settings); // CORRIGIDO: O método 'update' agora existe na interface.
  }

  async getStoreSettings(): Promise<StoreSetting | null> {
    return this.storeSettingRepository.findUnique(); // CORRIGIDO: O método 'findUnique' agora existe na interface.
  }

  // MÉTODO OBRIGATÓRIO (para satisfazer IAdminService)
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
