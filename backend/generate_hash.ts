// backend/generate_hash.ts
// ... (imports)

const prisma = new PrismaClient();
const PLAIN_PASSWORD = "admin123"; // 🚨 ESTA É A NOVA SENHA QUE VOCÊ DEVE USAR PARA LOGAR 🚨
const ADMIN_USERNAME = process.env.ADMIN_EMAIL || "admin@123"; // Corrigido para ADMIN_USERNAME, mas mantendo a leitura da variável ADMIN_EMAIL

async function generateAndSeedAdminPassword() {
  try {
    // ... (hash generation logic)

    // 🚨 CORREÇÃO: Usar adminCredentials.upsert e setar o username e admin_password
    await prisma.adminCredentials.upsert({
      where: { id: "admin_credentials" }, // O ID fixo da linha é 'admin_credentials'
      update: {
        admin_password: newHashedPassword,
        username: ADMIN_USERNAME, // Corrigido: Agora salva o username
      },
      create: {
        id: "admin_credentials",
        admin_password: newHashedPassword,
        username: ADMIN_USERNAME, // Corrigido: Agora salva o username
      },
    });

    console.log(
      `\n✅ O registro de AdminCredentials foi ATUALIZADO com o novo HASH.`
    );
    console.log(`Username de Login: ${ADMIN_USERNAME}`);
    console.log(`Nova Senha: ${PLAIN_PASSWORD}`);
  } catch (error) {
    // ... (error handling)
  } finally {
    await prisma.$disconnect();
  }
}

generateAndSeedAdminPassword();
