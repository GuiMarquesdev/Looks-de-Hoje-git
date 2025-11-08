"use strict";
// backend/src/repositories/PrismaPieceRepository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaPieceRepository = void 0;
// 🛑 CORREÇÃO: Renomeamos 'Piece' importado para 'PrismaPiece' e importamos 'Category' para criar nosso próprio tipo 'Piece' rico.
const client_1 = require("@prisma/client");
class PrismaPieceRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // Métodos findAll e findById agora retornam o novo tipo Piece
    async findAll() {
        const pieces = await this.prisma.piece.findMany({
            include: {
                category: true,
            },
            orderBy: {
                created_at: "desc",
            },
        });
        return pieces; // O cast satisfaz o compilador, pois a estrutura está correta.
    }
    async findById(id) {
        const piece = await this.prisma.piece.findUnique({
            where: { id },
            include: {
                category: true,
            },
        });
        return piece;
    }
    async create(data) {
        // 🛑 CORREÇÃO: Usar o campo 'images' (JSON) e não 'image_urls' (string[])
        if (!data.name ||
            data.price === undefined ||
            !data.category_id ||
            !data.images || // 🛑 CORREÇÃO: Verificar 'images' (array de objetos JSON)
            data.images.length === 0) {
            throw new Error("Dados incompletos para criar a peça.");
        }
        const status = data.is_available ? "available" : "rented";
        // Obtém a URL da primeira imagem para o campo image_url (string?)
        const mainImageUrl = data.images.length > 0 ? data.images[0].url : null;
        const createPayload = {
            name: data.name,
            description: data.description,
            price: data.price,
            status: status,
            category: { connect: { id: data.category_id } },
            image_url: mainImageUrl, // Usa a primeira URL
            images: data.images, // 🛑 CORREÇÃO: Passa o JSON completo de 'images'
            measurements: data.measurements, // 🛑 CORREÇÃO: Adicionado 'measurements'
        };
        const newPiece = await this.prisma.piece.create({
            data: createPayload,
            include: {
                category: true,
            },
        });
        return newPiece;
    }
    async update(id, data) {
        const updateData = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                if (key === "name") {
                    updateData.name = value;
                    continue;
                }
                if (key === "is_available") {
                    updateData.status = value ? "available" : "rented";
                    continue;
                }
                // 🛑 CORREÇÃO: Tratar o campo 'images' (JSON)
                if (key === "images" && Array.isArray(value)) {
                    // Atualiza image_url com a primeira URL do novo array de imagens
                    updateData.image_url =
                        value.length > 0 ? value[0].url : null;
                    updateData.images = value; // Salva o JSON completo
                    continue;
                }
                // 🛑 CORREÇÃO: Tratar o campo 'measurements' (JSON)
                if (key === "measurements" && value !== null) {
                    updateData.measurements = value;
                    continue;
                }
                if (key === "category_id") {
                    // A categoria é tratada abaixo
                }
                // Ignorar 'title' que não existe no modelo Piece, mas está no DTO
                if (key === "title")
                    continue;
                updateData[key] = value;
            }
        }
        if (updateData.category_id !== undefined) {
            updateData.category = { connect: { id: updateData.category_id } };
            delete updateData.category_id;
        }
        try {
            const updatedPiece = await this.prisma.piece.update({
                where: { id },
                data: updateData,
                include: {
                    category: true,
                },
            });
            return updatedPiece;
        }
        catch (e) {
            // Retorna null se a peça não for encontrada durante a atualização
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === "P2025") {
                return null;
            }
            throw e;
        }
    }
    async updateStatus(id, newStatus) {
        try {
            const piece = await this.prisma.piece.update({
                where: { id },
                data: { status: newStatus },
                include: {
                    category: true,
                },
            });
            return piece;
        }
        catch (e) {
            // Se a peça não for encontrada para atualização, o Prisma lança um erro com código P2025
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === "P2025") {
                return null;
            }
            // Relança outros erros (como erro de banco de dados)
            throw e;
        }
    }
    async delete(id) {
        await this.prisma.piece.delete({
            where: { id },
        });
    }
}
exports.PrismaPieceRepository = PrismaPieceRepository;
//# sourceMappingURL=PrismaPieceRepository.js.map