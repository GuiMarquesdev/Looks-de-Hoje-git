"use strict";
// backend/src/services/AdminService.ts (Versão Refatorada para Sem Login)
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
// As variáveis de ambiente não são mais necessárias para autenticação
// const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_insecure"; // <-- REMOVIDO
// const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@exemplo.com"; // <-- REMOVIDO
class AdminService {
    constructor(storeSettingRepository // private adminCredentialsRepository: IAdminCredentialsRepository // <-- REMOVIDO
    ) {
        this.storeSettingRepository = storeSettingRepository;
    }
    login(email, password) {
        throw new Error("Method not implemented.");
    }
    changePassword(currentPassword, newPassword) {
        throw new Error("Method not implemented.");
    }
    // 1. O Login foi REMOVIDO.
    // 2. Implementação do GET Settings (CORRIGIDO: Apenas StoreSetting)
    async getSettings() {
        const settings = await this.storeSettingRepository.getSettings();
        if (settings) {
            return settings;
        }
        return null;
    }
    // 3. Implementação do Update Store Info (CORRIGIDO: Apenas StoreSetting)
    async updateStoreInfo(data) {
        if (!data.store_name) {
            throw new Error("O nome da loja é obrigatório.");
        }
        return this.storeSettingRepository.updateStoreInfo(data);
    }
}
exports.AdminService = AdminService;
// **Ações Adicionais:** Você precisa remover 'login' e 'changePassword' da interface IAdminService
// E remover todas as importações de IAdminCredentialsRepository
//# sourceMappingURL=AdminService.js.map