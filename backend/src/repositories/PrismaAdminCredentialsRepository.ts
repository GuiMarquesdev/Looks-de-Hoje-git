import { PrismaClient, AdminCredentials } from "@prisma/client";

interface IAdminCredentialsRepository {
  getCredentials(): Promise<AdminCredentials | null>;
  updateAdminPassword(newHashedPassword: string): Promise<AdminCredentials>;
}

export class PrismaAdminCredentialsRepository
  implements IAdminCredentialsRepository
{
  // Use um ID fixo para garantir que só haja um registro de credenciais
  private static readonly ADMIN_ID = "admin_credentials";

  constructor(private prisma: PrismaClient) {}

  async getCredentials(): Promise<AdminCredentials | null> {
    return this.prisma.adminCredentials.findUnique({
      where: { id: PrismaAdminCredentialsRepository.ADMIN_ID },
    });
  }

  async updateAdminPassword(
    newHashedPassword: string
  ): Promise<AdminCredentials> {
    return this.prisma.adminCredentials.upsert({
      where: { id: PrismaAdminCredentialsRepository.ADMIN_ID },
      update: { admin_password: newHashedPassword },
      create: {
        id: PrismaAdminCredentialsRepository.ADMIN_ID,
        admin_password: newHashedPassword,
      },
    });
  }
}
