// src/pages/admin/PiecesManagement.tsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  MoreHorizontal,
  Plus,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MultipleImageUpload,
  ProductImage,
} from "@/components/admin/MultipleImageUpload";
import { ImageFramingTool } from "@/components/admin/ImageFramingTool";

const API_URL = "http://localhost:8000/api";
const PIECES_URL = `${API_URL}/pieces`;
const CATEGORIES_URL = `${API_URL}/categories`;
const UPLOAD_URL = `${API_URL}/pieces/upload-images`;

// Helper para pegar token
const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("authToken");

// Interfaces
interface Piece {
  id: string;
  name: string;
  category_id: string;
  category?: { name: string };
  status: "available" | "rented";
  image_url?: string;
  images?: Array<{ url: string; order: number }>;
  image_position_x?: number;
  image_position_y?: number;
  image_zoom?: number;
  description?: string;
  measurements?: Record<string, string>;
  price?: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
}

// Schema de Validação
const pieceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(60, "Máximo 60 caracteres"),
  category_id: z.string().min(1, "Categoria é obrigatória"),
  status: z.enum(["available", "rented"]),
  description: z.string().max(350, "Máximo 350 caracteres").optional(),
  measurements: z.record(z.string()).optional(),
  price: z
    .string()
    .min(1, "Preço é obrigatório")
    .refine(
      (val) => {
        if (!val) return true;
        return /^\s*\d*([,\.]\d{1,2})?\s*$/.test(val.trim());
      },
      { message: "Formato inválido (use apenas números e vírgula/ponto)." }
    ),
  images: z.array(z.any()).optional(),
});

type PieceFormValues = z.infer<typeof pieceSchema>;

const PiecesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPiece, setEditingPiece] = useState<Piece | null>(null);
  const [uploading, setUploading] = useState(false);

  // Estados para Imagens e Enquadramento
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [imagePositionX, setImagePositionX] = useState(50);
  const [imagePositionY, setImagePositionY] = useState(50);
  const [imageZoom, setImageZoom] = useState(100);

  const form = useForm<PieceFormValues>({
    resolver: zodResolver(pieceSchema),
    defaultValues: {
      name: "",
      category_id: "",
      status: "available",
      description: "",
      measurements: {},
      price: "",
      images: [],
    },
  });

  useEffect(() => {
    fetchPieces();
    fetchCategories();
  }, []);

  const fetchPieces = async () => {
    try {
      const response = await fetch(PIECES_URL);
      if (!response.ok) throw new Error("Erro ao buscar peças.");
      const data = await response.json();

      const formattedData = data.map((p: any) => ({
        ...p,
        id: String(p.id),
        category_id: String(p.category_id),
      }));

      setPieces(formattedData);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar peças");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(CATEGORIES_URL);
      if (!response.ok) throw new Error("Erro ao buscar categorias.");
      const data = await response.json();

      const formattedCategories = data.map((c: any) => ({
        ...c,
        id: String(c.id),
      }));

      setCategories(formattedCategories || []);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleStatus = async (piece: Piece) => {
    const token = getToken();
    if (!token) return toast.error("Faça login para continuar.");

    try {
      const newStatus = piece.status === "available" ? "rented" : "available";
      const response = await fetch(`${PIECES_URL}/${piece.id}/toggle-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Erro ao alterar status");
      toast.success("Status atualizado!");
      fetchPieces();
    } catch (error) {
      toast.error("Erro ao alterar status");
    }
  };

  const deletePiece = async (piece: Piece) => {
    const token = getToken();
    if (!token) return toast.error("Faça login para continuar.");
    if (!window.confirm(`Excluir "${piece.name}"?`)) return;

    try {
      const response = await fetch(`${PIECES_URL}/${piece.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Erro ao excluir");
      toast.success("Peça removida");
      fetchPieces();
    } catch (error) {
      toast.error("Erro ao excluir peça");
    }
  };

  const uploadNewImages = async (images: ProductImage[]): Promise<string[]> => {
    const filesToUpload = images
      .filter((img) => img.isNew && img.file)
      .map((img) => img.file) as File[];

    if (filesToUpload.length === 0) return [];
    const token = getToken();
    if (!token) throw new Error("Sessão expirada.");

    const formData = new FormData();
    filesToUpload.forEach((file) => formData.append("files[]", file));

    try {
      const response = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Falha no upload");
      const data = await response.json();
      return data.urls || [];
    } catch (error) {
      throw error;
    }
  };

  const onSubmit = async (values: PieceFormValues) => {
    const token = getToken();
    if (!token) return toast.error("Sessão expirada.");

    try {
      setUploading(true);
      const newPermanentUrls = await uploadNewImages(productImages);

      const existingImages = productImages
        .filter((img) => !img.isNew)
        .map((img) => img.image_url)
        .filter((url) => url && !url.startsWith("blob:")) as string[];

      const finalUrlList = [...existingImages, ...newPermanentUrls];
      const finalImages = finalUrlList.map((url, index) => ({
        url,
        order: index + 1,
      }));

      if (finalImages.length === 0)
        throw new Error("Adicione pelo menos uma imagem.");

      const priceForApi = values.price
        ? parseFloat(values.price.replace(",", "."))
        : 0;

      let cleanMeasurements = undefined;
      if (values.measurements) {
        cleanMeasurements = {};
        Object.entries(values.measurements).forEach(([k, v]) => {
          if (v && v.trim() !== "") cleanMeasurements[k] = v;
        });
      }

      const pieceData = {
        name: values.name,
        category_id: values.category_id,
        status: values.status,
        images: finalImages,
        image_url: finalImages[0].url,
        image_position_x: imagePositionX,
        image_position_y: imagePositionY,
        image_zoom: imageZoom,
        description: values.description || null,
        measurements: cleanMeasurements,
        price: priceForApi,
      };

      const url = editingPiece
        ? `${PIECES_URL}/${editingPiece.id}`
        : PIECES_URL;
      const method = editingPiece ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(pieceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 422 && errorData.errors) {
          const msgs = Object.values(errorData.errors).flat().join("\n");
          throw new Error(`Validação falhou:\n${msgs}`);
        }
        throw new Error(errorData.message || "Erro ao salvar");
      }

      toast.success(editingPiece ? "Peça atualizada!" : "Peça adicionada!");
      setIsDialogOpen(false);
      fetchPieces();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setUploading(false);
    }
  };

  const openAddDialog = () => {
    setEditingPiece(null);
    setProductImages([]);
    setImagePositionX(50);
    setImagePositionY(50);
    setImageZoom(100);

    const defaultCatId = categories.length > 0 ? String(categories[0].id) : "";

    form.reset({
      name: "",
      category_id: defaultCatId,
      status: "available",
      description: "",
      measurements: {
        busto: "",
        cintura: "",
        quadril: "",
        comprimento: "",
        tamanho: "",
      },
      price: "",
      images: [],
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (piece: Piece) => {
    setEditingPiece(piece);

    const pieceImages: ProductImage[] =
      piece.images && piece.images.length > 0
        ? piece.images.map((img) => ({
            image_url: img.url,
            order: img.order,
            isNew: false,
          }))
        : piece.image_url
        ? [{ image_url: piece.image_url, order: 0, isNew: false }]
        : [];
    setProductImages(pieceImages);

    setImagePositionX(piece.image_position_x ?? 50);
    setImagePositionY(piece.image_position_y ?? 50);
    setImageZoom(piece.image_zoom ?? 100);

    form.reset({
      name: piece.name,
      category_id: String(piece.category_id),
      status: piece.status,
      description: piece.description || "",
      measurements: piece.measurements || {
        busto: "",
        cintura: "",
        quadril: "",
        comprimento: "",
        tamanho: "",
      },
      price: piece.price ? piece.price.toString().replace(".", ",") : "",
      images: [],
    });
    setIsDialogOpen(true);
  };

  const filteredPieces = pieces.filter(
    (piece) =>
      piece.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      piece.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-6">Carregando catálogo...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-playfair font-bold">Gestão de Peças</h1>
          <p className="text-muted-foreground font-montserrat">
            Catálogo completo
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openAddDialog}
              className="flex items-center gap-2 bg-primary"
            >
              <Plus className="w-4 h-4" /> Nova Peça
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPiece ? "Editar Peça" : "Nova Peça"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="available">
                              Disponível
                            </SelectItem>
                            <SelectItem value="rented">Alugada</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0,00"
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.replace(/[^\d,\.]/g, "")
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Imagens (Máx: 10)</FormLabel>
                  <MultipleImageUpload
                    images={productImages}
                    onChange={setProductImages}
                    maxImages={10}
                  />
                </div>

                {productImages.length > 0 && productImages[0].image_url && (
                  <ImageFramingTool
                    imageUrl={productImages[0].image_url}
                    positionX={imagePositionX}
                    positionY={imagePositionY}
                    zoom={imageZoom}
                    onPositionChange={(x, y) => {
                      setImagePositionX(x);
                      setImagePositionY(y);
                    }}
                    onZoomChange={setImageZoom}
                    title="Ajuste da Capa"
                  />
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Detalhes..."
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <div className="text-xs text-right text-muted-foreground">
                        {field.value?.length || 0}/350 caracteres
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medidas</FormLabel>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Busto"
                            value={field.value?.busto || ""}
                            onChange={(e) =>
                              field.onChange({
                                ...field.value,
                                busto: e.target.value,
                              })
                            }
                          />
                          <Input
                            placeholder="Cintura"
                            value={field.value?.cintura || ""}
                            onChange={(e) =>
                              field.onChange({
                                ...field.value,
                                cintura: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Quadril"
                            value={field.value?.quadril || ""}
                            onChange={(e) =>
                              field.onChange({
                                ...field.value,
                                quadril: e.target.value,
                              })
                            }
                          />
                          <Input
                            placeholder="Comprimento"
                            value={field.value?.comprimento || ""}
                            onChange={(e) =>
                              field.onChange({
                                ...field.value,
                                comprimento: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Input
                          placeholder="Tamanho (P/M/G)"
                          value={field.value?.tamanho || ""}
                          onChange={(e) =>
                            field.onChange({
                              ...field.value,
                              tamanho: e.target.value,
                            })
                          }
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading}
                    className="bg-primary"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Salvando...
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Peças</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPieces.map((piece) => (
                <TableRow key={piece.id}>
                  <TableCell>
                    {(() => {
                      // CORREÇÃO: Tenta pegar image_url OU a primeira imagem do array
                      const displayImage =
                        piece.image_url ||
                        (piece.images && piece.images.length > 0
                          ? piece.images[0].url
                          : null);

                      return displayImage ? (
                        <img
                          src={displayImage}
                          alt={piece.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="font-medium">{piece.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{piece.category?.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        piece.status === "available" ? "default" : "destructive"
                      }
                    >
                      {piece.status === "available" ? "Disponível" : "Alugada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(piece)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatus(piece)}>
                          {piece.status === "available" ? (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" /> Marcar
                              Alugada
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" /> Marcar
                              Disponível
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deletePiece(piece)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPieces.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Nenhuma peça encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PiecesManagement;
