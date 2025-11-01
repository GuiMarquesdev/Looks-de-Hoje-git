// backend/src/repositories/PrismaStoreSettingRepository.ts

import { PrismaClient, StoreSetting } from "@prisma/client";
import { IStoreSettingRepository } from "../interfaces/IStoreSettingRepository";
import { StoreSettingsDTO } from "../common/types";

const STORE_SETTINGS_ID = "settings"; // ID fixo para o registro de configurações

export class PrismaStoreSettingRepository implements IStoreSettingRepository {
  constructor(private prisma: PrismaClient) {}
  updateAdminPassword(hashedPassword: string): Promise<StoreSetting> {
    throw new Error("Method not implemented.");
  }

  async getSettings(): Promise<StoreSetting | null> {
    return this.prisma.storeSetting.findUnique({
      where: { id: STORE_SETTINGS_ID },
    });
  }

  async updateStoreInfo(
    data: Partial<StoreSettingsDTO>
  ): Promise<StoreSetting> {
    // O AdminService valida que data.store_name existe.
    if (!data.store_name) {
      throw new Error("O nome da loja é obrigatório.");
    }

    // Prepara os dados para atualização (ignora campos indefinidos)
    const updateData: Partial<StoreSettingsDTO> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        (updateData as any)[key] = value;
      }
    }

    // 🚨 CORREÇÃO CRÍTICA: Usa upsert para criar o registro se ele não existir
    return this.prisma.storeSetting.upsert({
      where: { id: STORE_SETTINGS_ID },
      update: updateData, // O que será atualizado se o registro for encontrado
      create: {
        // O que será criado se o registro não for encontrado
        id: STORE_SETTINGS_ID,
        store_name: data.store_name,
        instagram_url: data.instagram_url,
        whatsapp_url: data.whatsapp_url,
        email: data.email,
      },
    });
  }
}
