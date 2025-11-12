"use strict";
// backend/src/repositories/PrismaStoreSettingRepository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaStoreSettingRepository = void 0;
const STORE_SETTINGS_ID = "settings"; // ID fixo para o registro de configurações
class PrismaStoreSettingRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // ✅ Implementa o método 'getSettings' da interface
    async getSettings() {
        return this.prisma.storeSetting.findUnique({
            where: { id: STORE_SETTINGS_ID },
        });
    }
    // ✅ Implementa o método 'updateStoreInfo' da interface
    async updateStoreInfo(data) {
        // O AdminService valida que data.store_name existe.
        if (!data.store_name) {
            throw new Error("O nome da loja é obrigatório.");
        }
        // Prepara os dados para atualização (ignora campos indefinidos)
        const updateData = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                updateData[key] = value;
            }
        }
        // Usa upsert para criar o registro se ele não existir
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
exports.PrismaStoreSettingRepository = PrismaStoreSettingRepository;
//# sourceMappingURL=PrismaStoreSettingRepository.js.map