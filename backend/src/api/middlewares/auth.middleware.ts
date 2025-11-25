import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

// Defina a interface para o payload do JWT
interface JwtPayload {
  id: string;
  username: string;
  // Adicione mais campos de usuário/permissão se necessário
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  // Isso é um erro fatal que deve ser corrigido antes de rodar o servidor
  console.error(
    "ERRO FATAL: JWT_SECRET não está definido nas variáveis de ambiente."
  );
  throw new Error("JWT_SECRET is not defined.");
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Obter o cabeçalho de autorização
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization token missing or invalid format." });
  }

  // 2. Extrair o token
  const token = authHeader.split(" ")[1];

  try {
    // 3. Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // 4. Anexar o usuário à requisição (opcional, mas útil)
    (req as any).user = decoded;

    // 5. Prosseguir para o próximo manipulador de rota
    next();
  } catch (error) {
    // Erro na verificação (token inválido, expirado, etc.)
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
