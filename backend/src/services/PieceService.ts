// backend/src/services/PieceService.ts

import { IPieceRepository } from "../interfaces/IPieceRepository";
// Importa a entidade Piece do Prisma
import { Piece } from "@prisma/client";
import { CreatePieceDTO, UpdatePieceDTO } from "../common/types";
import { IPieceService } from "../interfaces/IPieceService";

// Função auxiliar para validação da descrição
function validateDescription(description: string | undefined): void {
  const MAX_LENGTH = 350;
  if (description && description.length > MAX_LENGTH) {
    throw new Error(
      `A descrição não pode ter mais de ${MAX_LENGTH} caracteres.`
    );
  }
}

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
    validateDescription(data.description); // <--- VALIDAÇÃO ADICIONADA AQUI
    return this.pieceRepository.create(data);
  }

  async updatePiece(id: string, data: UpdatePieceDTO): Promise<Piece | null> {
    // Adicionar validações de negócio aqui, se necessário
    validateDescription(data.description); // <--- VALIDAÇÃO ADICIONADA AQUI
    return this.pieceRepository.update(id, data);
  }

  // 🚨 CORREÇÃO: Lógica do Service alterada para simplesmente ATUALIZAR para o status fornecido.
  // O frontend já envia o status final desejado. Removemos a lógica de alternância (toggle).
  async togglePieceStatus(
    id: string,
    // O nome da variável alterado para 'desiredStatus' para maior clareza,
    // embora o tipo de entrada da interface IPieceService.ts seja mantido.
    desiredStatus: "available" | "rented"
  ): Promise<Piece | null> {
    // Agora, o newStatus é simplesmente o que foi enviado pelo frontend.
    const newStatus = desiredStatus;

    // Chama o repositório para atualizar com o status FINAL desejado
    return this.pieceRepository.updateStatus(id, newStatus);
  }

  async deletePiece(id: string): Promise<void> {
    await this.pieceRepository.delete(id);
  }
}
