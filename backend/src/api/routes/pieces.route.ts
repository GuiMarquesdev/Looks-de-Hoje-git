// backend/src/api/routes/pieces.route.ts

import { Router, Request, Response } from "express";
import { IRepositoryFactory } from "../../factories/IRepositoryFactory";
import { CreatePieceDTO, UpdatePieceDTO } from "../../common/types";
import { PieceService } from "../../services/PieceService";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configuração do multer para armazenar imagens
const uploadDir = path.join(__dirname, "../../../uploads");

// Cria a pasta uploads se não existir
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Apenas imagens são permitidas!"));
    }
  },
});

export const createPiecesRoutes = (repositoryFactory: IRepositoryFactory) => {
  const router = Router();
  const pieceRepository = repositoryFactory.createPieceRepository();
  const pieceService = new PieceService(pieceRepository);

  // GET /api/pieces - Listar todas as peças
  router.get("/", async (req: Request, res: Response) => {
    try {
      const pieces = await pieceService.getAllPieces();
      return res.json(pieces);
    } catch (error) {
      console.error("Error fetching pieces:", error);
      return res.status(500).json({ message: "Erro ao buscar peças." });
    }
  });

  // GET /api/pieces/:id - Buscar peça por ID
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const piece = await pieceService.getPieceById(id);

      if (!piece) {
        return res.status(404).json({ message: "Peça não encontrada." });
      }

      return res.json(piece);
    } catch (error) {
      console.error("Error fetching piece:", error);
      return res.status(500).json({ message: "Erro ao buscar peça." });
    }
  });

  // POST /api/pieces/upload-images - Upload real de imagens
  router.post(
    "/upload-images",
    upload.array("files", 10),
    async (req: Request, res: Response) => {
      try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
          return res
            .status(400)
            .json({ message: "Nenhum arquivo foi enviado." });
        }

        // Gera URLs das imagens salvas
        const urls = files.map((file) => {
          return `http://localhost:3000/uploads/${file.filename}`;
        });

        return res.json({ urls });
      } catch (error) {
        console.error("Error uploading images:", error);
        return res
          .status(500)
          .json({ message: "Erro ao fazer upload de imagens." });
      }
    }
  );

  // POST /api/pieces - Criar nova peça
  router.post("/", async (req: Request, res: Response) => {
    try {
      const incomingData = req.body;

      const isAvailable = incomingData.status === "available";

      const data: CreatePieceDTO = {
        name: incomingData.name,
        price: incomingData.price ? Number(incomingData.price) : 100,
        is_available: isAvailable,
        category_id: incomingData.category_id,
        // CORREÇÃO APLICADA: Adicionar filtro para remover undefined/null/"" antes de enviar ao Prisma
        image_urls: (incomingData.images || [])
          .map((img: any) => img.url)
          .filter(Boolean) as string[], // Esta linha remove os valores falsy, como 'undefined'
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

  // PUT /api/pieces/:id - Atualizar peça
  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const incomingData = req.body;

      const updateData: Partial<UpdatePieceDTO> = {
        name: incomingData.name,
        price: incomingData.price ? Number(incomingData.price) : undefined,
        is_available: incomingData.status
          ? incomingData.status === "available"
          : undefined,
        category_id: incomingData.category_id,
        // CORREÇÃO APLICADA: Adicionar filtro para remover undefined/null/"" antes de enviar ao Prisma
        image_urls: (incomingData.images || [])
          .map((img: any) => img.url)
          .filter(Boolean) as string[], // .filter(Boolean) remove todos os valores falsy (incluindo undefined)
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

  // PUT /api/pieces/:id/toggle-status - Alternar status
  router.put("/:id/toggle-status", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { status } = req.body;

      const currentPiece = await pieceService.getPieceById(id);
      if (!currentPiece) {
        return res.status(404).json({ message: "Peça não encontrada." });
      }

      const updatedPiece = await pieceService.togglePieceStatus(
        id,
        status as "available" | "rented"
      );

      return res.json(updatedPiece);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erro ao alterar status.";
      return res.status(400).json({ message: msg });
    }
  });

  // DELETE /api/pieces/:id - Deletar peça
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await pieceService.deletePiece(id);
      return res.status(204).send();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erro ao deletar peça.";
      return res.status(400).json({ message: msg });
    }
  });

  return router;
};
