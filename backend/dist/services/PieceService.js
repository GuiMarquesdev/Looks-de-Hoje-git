"use strict";
// backend/src/services/PieceService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PieceService = void 0;
class PieceService {
    constructor(pieceRepository) {
        this.pieceRepository = pieceRepository;
    }
    async getAllPieces() {
        return this.pieceRepository.findAll();
    }
    async getPieceById(id) {
        return this.pieceRepository.findById(id);
    }
    async createPiece(data) {
        // Adicionar validações de negócio aqui, se necessário
        return this.pieceRepository.create(data);
    }
    async updatePiece(id, data) {
        // Adicionar validações de negócio aqui, se necessário
        return this.pieceRepository.update(id, data);
    }
    // 🚨 NOVO: Lógica do Service para alternar o status
    async togglePieceStatus(id, currentStatus) {
        const newStatus = currentStatus === "available" ? "rented" : "available";
        return this.pieceRepository.updateStatus(id, newStatus);
    }
    async deletePiece(id) {
        await this.pieceRepository.delete(id);
    }
}
exports.PieceService = PieceService;
//# sourceMappingURL=PieceService.js.map