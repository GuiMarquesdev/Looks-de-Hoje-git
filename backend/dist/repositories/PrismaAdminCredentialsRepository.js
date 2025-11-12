"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAdminCredentialsRepository = void 0;
class PrismaAdminCredentialsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * NOVO MÉTODO: Busca credenciais de administrador pelo nome de usuário.
     * Este é o método chave para o fluxo de login.
     */
    async findByUsername(username) {
        return this.prisma.adminCredentials.findUnique({
            // Agora usa o nome correto 'username'
            where: { username: username },
        });
    }
    // Método existente para obter o registro único (pode não ser mais necessário para o login)
    async getCredentials() {
        return this.prisma.adminCredentials.findUnique({
            where: { id: PrismaAdminCredentialsRepository.ADMIN_ID },
        });
    }
    // Método existente para atualização de senha.
    // Usa o ID fixo para garantir que a única conta de admin seja atualizada.
    async updateAdminPassword(newHashedPassword) {
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
exports.PrismaAdminCredentialsRepository = PrismaAdminCredentialsRepository;
// Mantido o ID fixo para o caso de a tabela ainda ser tratada como um único registro,
// especialmente para a função de atualização de senha.
PrismaAdminCredentialsRepository.ADMIN_ID = "admin_credentials";
//# sourceMappingURL=PrismaAdminCredentialsRepository.js.map