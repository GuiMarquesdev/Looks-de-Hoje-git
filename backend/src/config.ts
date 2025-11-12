// backend/src/config.ts

// Usando variáveis de ambiente do Node para configurar
// (Você deve garantir que as variáveis de ambiente estão sendo carregadas,
// tipicamente com uma biblioteca como 'dotenv' em seu ponto de entrada)
export const config = {
  // A chave secreta é essencial para a função de login (JWT)
  jwtSecret: process.env.JWT_SECRET || "sua-chave-secreta-padrao-aqui",

  // Outras configurações da sua aplicação (como a porta)
  port: process.env.PORT || 3000,
  // ... outras configurações
};

// Se você estiver usando um sistema de carregamento de variáveis de ambiente
// que garante que process.env.JWT_SECRET está preenchido, você pode simplificar
// para:
// export const config = {
//   jwtSecret: process.env.JWT_SECRET as string,
//   port: parseInt(process.env.PORT || '3000'),
// };
