// backend/src/api/routes/pieces.route.ts

import { Router, Request, Response, NextFunction } from "express";
import { IRepositoryFactory } from "../../factories/IRepositoryFactory";
import { Piece } from "@prisma/client";
import { CreatePieceDTO, UpdatePieceDTO } from "../../common/types";
import { PieceService } from "../../services/PieceService";

export const createPiecesRoutes = (repositoryFactory: IRepositoryFactory) => {
  const router = Router();
  const pieceRepository = repositoryFactory.createPieceRepository();
  const pieceService = new PieceService(pieceRepository);

  // ... (upload-images route and GET routes)

  // POST /api/pieces (Criação de nova peça)
  router.post("/", async (req: Request, res: Response) => {
    try {
      const incomingData = req.body;

      const isAvailable = incomingData.status === "available";

      // 🚨 CORRIGIDO: Usando 'name' e 'price' diretamente no DTO
      const data: CreatePieceDTO = {
        name: incomingData.name, // Usa 'name' do frontend
        price: incomingData.price ? Number(incomingData.price) : 100, // Converte para Number e fornece default
        is_available: isAvailable,
        category_id: incomingData.category_id,
        image_urls: (incomingData.images || [])
          .map((img: any) => img.url)
          .filter((url: string) => url && typeof url === "string"),
        description: incomingData.description,
        title: "",
      };

      if (
        !data.name ||
        !data.price ||
        !data.category_id ||
        data.image_urls.length === 0
      ) {
        throw new Error("Dados incompletos para criar a peça.");
      }

      const newPiece = await pieceService.createPiece(data);
      return res.status(201).json(newPiece);
    } catch (error) {
      console.error("Erro ao salvar peça:", error);
      const msg =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao criar peça.";
      return res.status(400).json({
        message: msg,
      });
    }
  });

  // PUT /api/pieces/:id (Atualização de peça)
  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const incomingData = req.body;

      // 🚨 CORRIGIDO: Mapear 'name' e 'price'
      const updateData: Partial<UpdatePieceDTO> = {
        name: incomingData.name,
        price: incomingData.price ? Number(incomingData.price) : undefined,
        is_available: incomingData.status
          ? incomingData.status === "available"
          : undefined,
        category_id: incomingData.category_id,
        image_urls: (incomingData.images || []).map((img: any) => img.url),
        description: incomingData.description,
      };

      Object.keys(updateData).forEach(
        (key) =>
          updateData[key as keyof UpdatePieceDTO] === undefined &&
          delete updateData[key as keyof UpdatePieceDTO]
      );

      const updatedPiece = await pieceService.updatePiece(
        id,
        updateData as UpdatePieceDTO
      );

      if (!updatedPiece) {
        return res.status(404).json({ message: "Peça não encontrada." });
      }

      return res.json(updatedPiece);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erro ao atualizar peça.";
      return res.status(400).json({ message: msg });
    }
  });

  // ... (toggle-status e DELETE routes permanecem inalterados)

  return router;
};
