"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAdminCredentialsRepository = void 0;
class PrismaAdminCredentialsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCredentials() {
        return this.prisma.adminCredentials.findUnique({
            where: { id: PrismaAdminCredentialsRepository.ADMIN_ID },
        });
    }
    async updateAdminPassword(newHashedPassword) {
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
exports.PrismaAdminCredentialsRepository = PrismaAdminCredentialsRepository;
// Use um ID fixo para garantir que só haja um registro de credenciais
PrismaAdminCredentialsRepository.ADMIN_ID = "admin_credentials";
//# sourceMappingURL=PrismaAdminCredentialsRepository.js.map