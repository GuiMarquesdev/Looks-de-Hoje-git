// backend/src/interfaces/IPieceRepository.ts

// CORREÇÃO: Importa a entidade 'Piece' diretamente do Prisma Client
import { Piece } from "@prisma/client";
// Importa os DTOs de criação e atualização
import { CreatePieceDTO, UpdatePieceDTO } from "../common/types";

// Interface que define os métodos que o repositório de peças deve implementar.
export interface IPieceRepository {
  // Busca todas as peças (pode adicionar filtros/paginações depois)
  findAll(): Promise<Piece[]>;

  // Busca uma peça pelo ID
  findById(id: string): Promise<Piece | null>;

  // Cria uma nova peça
  create(data: CreatePieceDTO): Promise<Piece>;

  // Atualiza uma peça existente
  update(id: string, data: Partial<UpdatePieceDTO>): Promise<Piece | null>;

  // 🚨 NOVO: Atualiza o status de uma peça
  updateStatus(
    id: string,
    newStatus: "available" | "rented"
  ): Promise<Piece | null>;

  // Deleta uma peça pelo ID
  delete(id: string): Promise<void>;
}
