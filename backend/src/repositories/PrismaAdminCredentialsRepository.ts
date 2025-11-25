// backend/src/repositories/PrismaAdminCredentialsRepository.ts

import { AdminCredentials } from "@prisma/client";
// Este import agora encontra o 'PrismaClientInstance' em '../database/prisma.ts'
import { PrismaClientInstance } from "../database/prisma";
import { IAdminCredentialsRepository } from "../interfaces/IAdminCredentialsRepository";

export class PrismaAdminCredentialsRepository
  implements IAdminCredentialsRepository
{
  // Injeta a instância do Prisma Client no construtor
  constructor(private readonly prisma = PrismaClientInstance) {}

  // A função findByUsername (exemplo) utilizando a instância importada
  async findByUsername(username: string): Promise<AdminCredentials | null> {
    const adminCredentials = await this.prisma.adminCredentials.findUnique({
      where: {
        username: username,
      },
    });

    return adminCredentials;
  }
}
