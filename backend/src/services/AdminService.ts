// backend/src/services/AdminService.ts

import { IAdminService } from "../interfaces/IAdminService";
import { AdminLoginDTO } from "../common/types";
import { IAdminCredentialsRepository } from "../interfaces/IAdminCredentialsRepository";
import { sign } from "jsonwebtoken";
import { config } from "../config";
import * as bcrypt from "bcrypt"; // Importa o bcrypt para comparação de hash

export class AdminService implements IAdminService {
  constructor(
    private readonly adminCredentialsRepository: IAdminCredentialsRepository
  ) {}

  async login({ username, password }: AdminLoginDTO): Promise<string> {
    // 1. Busca as credenciais de administrador pelo username/email fornecido
    const admin = await this.adminCredentialsRepository.findByUsername(
      username
    );

    // 2. Verifica se o administrador existe
    if (!admin) {
      throw new Error("Invalid username or password"); // Retorna erro genérico por segurança
    }

    // 3. Compara a senha fornecida com o hash armazenado
    const passwordMatch = await bcrypt.compare(password, admin.admin_password);

    if (!passwordMatch) {
      throw new Error("Invalid username or password"); // Retorna erro genérico
    }

    // 4. Se as credenciais estiverem corretas, gera o token JWT
    const token = sign({ sub: admin.id, role: "admin" }, config.jwtSecret, {
      expiresIn: "7d",
    });

    return token;
  }
}
