import { AdminCredentials } from "@prisma/client";

export interface IAdminCredentialsRepository {
  getCredentials(): Promise<AdminCredentials | null>;
  updateAdminPassword(newHashedPassword: string): Promise<AdminCredentials>;
}
