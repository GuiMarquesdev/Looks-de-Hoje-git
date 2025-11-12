import { AdminCredentials } from "@prisma/client";

export interface IAdminCredentialsRepository {
  // ... outros métodos
  /** Adicionado para a função de login */
  findByUsername(username: string): Promise<AdminCredentials | null>;
}
