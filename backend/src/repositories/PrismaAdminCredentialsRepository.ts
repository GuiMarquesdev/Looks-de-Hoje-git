import { PrismaClient, AdminCredentials } from "@prisma/client";

/**
 * Interface atualizada para incluir a busca por nome de usuário.
 */
interface IAdminCredentialsRepository {
  // Novo método essencial para o login
  findByUsername(username: string): Promise<AdminCredentials | null>;

  // Mantido para compatibilidade, mas pode ser removido se não for usado.
  getCredentials(): Promise<AdminCredentials | null>;

  // Mantido para a funcionalidade de redefinição/mudança de senha.
  updateAdminPassword(newHashedPassword: string): Promise<AdminCredentials>;
}

export class PrismaAdminCredentialsRepository
  implements IAdminCredentialsRepository
{
  // Mantido o ID fixo para o caso de a tabela ainda ser tratada como um único registro,
  // especialmente para a função de atualização de senha.
  private static readonly ADMIN_ID = "admin_credentials";

  constructor(private prisma: PrismaClient) {}

  /**
   * NOVO MÉTODO: Busca credenciais de administrador pelo nome de usuário.
   * Este é o método chave para o fluxo de login.
   */
  async findByUsername(username: string): Promise<AdminCredentials | null> {
    return this.prisma.adminCredentials.findUnique({
      // Agora usa o nome correto 'username'
      where: { username: username },
    });
  }

  // Método existente para obter o registro único (pode não ser mais necessário para o login)
  async getCredentials(): Promise<AdminCredentials | null> {
    return this.prisma.adminCredentials.findUnique({
      where: { id: PrismaAdminCredentialsRepository.ADMIN_ID },
    });
  }

  // Método existente para atualização de senha.
  // Usa o ID fixo para garantir que a única conta de admin seja atualizada.
  async updateAdminPassword(
    newHashedPassword: string
  ): Promise<AdminCredentials> {
    return this.prisma.adminCredentials.upsert({
      where: { id: PrismaAdminCredentialsRepository.ADMIN_ID },
      // O campo de senha no seu modelo é 'admin_password'
      update: { admin_password: newHashedPassword },
      create: {
        id: PrismaAdminCredentialsRepository.ADMIN_ID,
        // CORREÇÃO: 'username' é o campo correto.
        username: "admin", 
        admin_password: newHashedPassword,
      },
    });
  }
}