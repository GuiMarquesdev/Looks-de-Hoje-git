// backend/src/repositories/PrismaAdminCredentialsRepository.ts

import { AdminCredentials } from "@prisma/client";
import { PrismaClientInstance } from "../database/prisma";
import { IAdminCredentialsRepository } from "../interfaces/IAdminCredentialsRepository";

export class PrismaAdminCredentialsRepository
  implements IAdminCredentialsRepository
{
  constructor(private readonly prisma = PrismaClientInstance) {}

  // A função findByUsername deve ser alterada para buscar pelo 'username'
  async findByUsername(username: string): Promise<AdminCredentials | null> {
    const adminCredentials = await this.prisma.adminCredentials.findUnique({
      where: {
        username: username, // <-- MUDANÇA PRINCIPAL: Busca pelo username
      },
    });

    return adminCredentials;
  }
}
