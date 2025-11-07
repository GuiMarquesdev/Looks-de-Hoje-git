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
    // 🚨 CORREÇÃO: Lógica do Service alterada para simplesmente ATUALIZAR para o status fornecido.
    // O frontend já envia o status final desejado. Removemos a lógica de alternância (toggle).
    async togglePieceStatus(id, 
    // O nome da variável alterado para 'desiredStatus' para maior clareza,
    // embora o tipo de entrada da interface IPieceService.ts seja mantido.
    desiredStatus) {
        // Agora, o newStatus é simplesmente o que foi enviado pelo frontend.
        const newStatus = desiredStatus;
        // Chama o repositório para atualizar com o status FINAL desejado
        return this.pieceRepository.updateStatus(id, newStatus);
    }
    async deletePiece(id) {
        await this.pieceRepository.delete(id);
    }
}
exports.PieceService = PieceService;
//# sourceMappingURL=PieceService.js.map