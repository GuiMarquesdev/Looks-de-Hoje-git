"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    // Garante que a aplicação não inicie sem a chave de segurança
    throw new Error("JWT_SECRET is not defined.");
}
class AdminService {
    constructor(adminCredentialsRepository, storeSettingRepository) {
        this.adminCredentialsRepository = adminCredentialsRepository;
        this.storeSettingRepository = storeSettingRepository;
    }
    // MÉTODO: Lógica de Login e Geração de JWT
    async login(username, passwordAttempt) {
        // 1. Buscar credenciais
        const adminCredentials = await this.adminCredentialsRepository.findByUsername(username);
        if (!adminCredentials) {
            return null; // Usuário não encontrado
        }
        // 2. Comparar a senha
        const isPasswordValid = await bcrypt.compare(passwordAttempt, adminCredentials.admin_password // CORREÇÃO: Usando 'admin_password'
        );
        if (!isPasswordValid) {
            return null; // Senha inválida
        }
        // 3. Gerar o JWT (payload: id e username)
        const payload = {
            id: adminCredentials.id,
            username: adminCredentials.username,
        };
        // Token expira em 1 dia (1d). Ajuste se necessário.
        // CORREÇÃO: Usando '!' em JWT_SECRET
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
        return { token, username: adminCredentials.username };
    }
    // Métodos de Store Settings (agora compatíveis com IStoreSettingRepository)
    async updateStoreSettings(settings) {
        return this.storeSettingRepository.update(settings); // CORRIGIDO: O método 'update' agora existe na interface.
    }
    async getStoreSettings() {
        return this.storeSettingRepository.findUnique(); // CORRIGIDO: O método 'findUnique' agora existe na interface.
    }
    // MÉTODO OBRIGATÓRIO (para satisfazer IAdminService)
    async changePassword(currentPassword, newPassword) {
        throw new Error("Method not implemented.");
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=AdminService.js.map