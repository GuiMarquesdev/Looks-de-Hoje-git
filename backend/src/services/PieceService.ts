// backend/src/services/PieceService.ts

import { IPieceRepository } from "../interfaces/IPieceRepository";
// Importa a entidade Piece do Prisma
import { Piece } from "@prisma/client";
import { CreatePieceDTO, UpdatePieceDTO } from "../common/types";
import { IPieceService } from "../interfaces/IPieceService";

export class PieceService implements IPieceService {
  constructor(private pieceRepository: IPieceRepository) {}

  async getAllPieces(): Promise<Piece[]> {
    return this.pieceRepository.findAll();
  }

  async getPieceById(id: string): Promise<Piece | null> {
    return this.pieceRepository.findById(id);
  }

  async createPiece(data: CreatePieceDTO): Promise<Piece> {
    // Adicionar validações de negócio aqui, se necessário
    return this.pieceRepository.create(data);
  }

  async updatePiece(id: string, data: UpdatePieceDTO): Promise<Piece | null> {
    // Adicionar validações de negócio aqui, se necessário
    return this.pieceRepository.update(id, data);
  }

  // 🚨 NOVO: Lógica do Service para alternar o status
  async togglePieceStatus(
    id: string,
    currentStatus: "available" | "rented"
  ): Promise<Piece | null> {
    const newStatus = currentStatus === "available" ? "rented" : "available";

    return this.pieceRepository.updateStatus(id, newStatus);
  }

  async deletePiece(id: string): Promise<void> {
    await this.pieceRepository.delete(id);
  }
}
