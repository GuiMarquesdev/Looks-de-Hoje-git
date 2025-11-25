// backend/src/repositories/PrismaPieceRepository.ts

// 🛑 CORREÇÃO: Renomeamos 'Piece' importado para 'PrismaPiece' e importamos 'Category' para criar nosso próprio tipo 'Piece' rico.
import {
  PrismaClient,
  Piece as PrismaPiece,
  Prisma,
  Category,
} from "@prisma/client";
import { IPieceRepository } from "../interfaces/IPieceRepository";
import { CreatePieceDTO, UpdatePieceDTO } from "../common/types";

// 🛑 CORREÇÃO: Definimos o tipo 'Piece' que o repositório realmente retorna (incluindo a relação 'category').
export type Piece = PrismaPiece & {
  category: Category;
};

// Usamos os tipos de utilidade do Prisma para input de dados.
type PieceCreatePrismaInput = Prisma.PieceCreateInput;
type PieceUpdatePrismaInput = Prisma.PieceUpdateInput;

export class PrismaPieceRepository implements IPieceRepository {
  constructor(private prisma: PrismaClient) {}

  // Métodos findAll e findById agora retornam o novo tipo Piece
  async findAll(): Promise<Piece[]> {
    const pieces = await this.prisma.piece.findMany({
      include: {
        category: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    return pieces as Piece[]; // O cast satisfaz o compilador, pois a estrutura está correta.
  }

  async findById(id: string): Promise<Piece | null> {
    const piece = await this.prisma.piece.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    return piece as Piece | null;
  }

  async create(data: CreatePieceDTO): Promise<Piece> {
    // 🛑 CORREÇÃO: Usar o campo 'images' (JSON) e não 'image_urls' (string[])
    if (
      !data.name ||
      data.price === undefined ||
      !data.category_id ||
      !data.images || // 🛑 CORREÇÃO: Verificar 'images' (array de objetos JSON)
      data.images.length === 0
    ) {
      throw new Error("Dados incompletos para criar a peça.");
    }

    const status = data.is_available ? "available" : "rented";

    // Obtém a URL da primeira imagem para o campo image_url (string?)
    const mainImageUrl =
      data.images.length > 0 ? (data.images[0] as { url: string }).url : null;

    const createPayload: PieceCreatePrismaInput = {
      name: data.name,
      description: data.description,
      price: data.price,
      status: status,
      category: { connect: { id: data.category_id } },
      image_url: mainImageUrl, // Usa a primeira URL
      images: data.images as any, // 🛑 CORREÇÃO: Passa o JSON completo de 'images'
      measurements: data.measurements as any, // 🛑 CORREÇÃO: Adicionado 'measurements'
    } as any;

    const newPiece = await this.prisma.piece.create({
      data: createPayload,
      include: {
        category: true,
      },
    });
    return newPiece as Piece;
  }

  async update(
    id: string,
    data: Partial<UpdatePieceDTO>
  ): Promise<Piece | null> {
    const updateData: { [key: string]: any } = {};
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
            value.length > 0 ? (value[0] as { url: string }).url : null;
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
        if (key === "title") continue;

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
        data: updateData as PieceUpdatePrismaInput,
        include: {
          category: true,
        },
      });
      return updatedPiece as Piece;
    } catch (e) {
      // Retorna null se a peça não for encontrada durante a atualização
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        return null;
      }
      throw e;
    }
  }

  async updateStatus(
    id: string,
    newStatus: "available" | "rented"
  ): Promise<Piece | null> {
    try {
      const piece = await this.prisma.piece.update({
        where: { id },
        data: { status: newStatus },
        include: {
          category: true,
        },
      });
      return piece as Piece;
    } catch (e) {
      // Se a peça não for encontrada para atualização, o Prisma lança um erro com código P2025
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        return null;
      }
      // Relança outros erros (como erro de banco de dados)
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.piece.delete({
      where: { id },
    });
  }
}
