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
import {
  MoreHorizontal,
  Plus,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ImageIcon,
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

const API_URL = "http://localhost:3000/api";
const PIECES_URL = `${API_URL}/pieces`;
const CATEGORIES_URL = `${API_URL}/categories`;
const UPLOAD_URL = `${API_URL}/pieces/upload-images`;

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
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
}

const pieceSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(60, "Nome deve ter no máximo 60 caracteres"),
  category_id: z.string().min(1, "Categoria é obrigatória"),
  status: z.enum(["available", "rented"]),
  description: z.string().optional(),
  measurements: z
    .record(z.string())
    .optional()
    .transform((val) => {
      if (val && Object.values(val).every((v) => v === "" || v === null)) {
        return undefined;
      }
      return val;
    }),
  images: z
    .array(
      z.object({
        url: z.string(),
        order: z.number(),
      })
    )
    .optional(),
});

const PiecesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPiece, setEditingPiece] = useState<Piece | null>(null);
  const [uploading, setUploading] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [imagePositionX, setImagePositionX] = useState(50);
  const [imagePositionY, setImagePositionY] = useState(50);
  const [imageZoom, setImageZoom] = useState(100);

  const form = useForm<z.infer<typeof pieceSchema>>({
    resolver: zodResolver(pieceSchema),
    defaultValues: {
      name: "",
      category_id: "",
      status: "available",
      description: "",
      measurements: {
        busto: "",
        cintura: "",
        quadril: "",
        comprimento: "",
        tamanho: "",
      },
    },
  });

  useEffect(() => {
    fetchPieces();
    fetchCategories();
  }, []);

  const fetchPieces = async () => {
    try {
      const piecesResponse = await fetch(PIECES_URL);
      if (!piecesResponse.ok) throw new Error("Erro ao buscar peças.");
      const data: Piece[] = await piecesResponse.json();
      setPieces(data);
    } catch (error) {
      console.error("Error fetching pieces:", error);
      toast.error("Erro ao carregar peças");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesResponse = await fetch(CATEGORIES_URL);
      if (!categoriesResponse.ok) throw new Error("Erro ao buscar categorias.");
      const data: Category[] = await categoriesResponse.json();
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const uploadNewImages = async (
    images: ProductImage[]
  ): Promise<Array<{ url: string; order: number }>> => {
    const filesToUpload = images
      .filter((img) => img.isNew && img.file)
      .map((img) => img.file) as File[];

    if (filesToUpload.length === 0) {
      return [];
    }

    const formData = new FormData();
    filesToUpload.forEach((file) => {
      formData.append("files", file);
    });

    try {
      console.log("📤 Enviando", filesToUpload.length, "arquivo(s)...");

      const uploadResponse = await fetch(UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || "Falha no upload de imagens.");
      }

      const { urls } = await uploadResponse.json();
      console.log("✅ Upload concluído. URLs:", urls);

      const newUploadedImages = urls.map((url: string, index: number) => ({
        url,
        order: images.filter((img) => !img.isNew).length + index,
      }));

      return newUploadedImages;
    } catch (error) {
      console.error("❌ Erro no upload:", error);
      toast.error("Erro ao fazer upload de uma ou mais imagens");
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof pieceSchema>) => {
    try {
      setUploading(true);
      console.log("🔄 Iniciando salvamento de peça...");
      console.log("📋 Valores do formulário:", values);
      console.log("🖼️ Imagens selecionadas:", productImages);

      const existingImages = productImages.filter((img) => !img.isNew);
      console.log("📦 Imagens existentes:", existingImages.length);

      const newImages = productImages.filter((img) => img.isNew);
      console.log("🆕 Imagens novas para upload:", newImages.length);

      const uploadedNewImages = await uploadNewImages(productImages);
      console.log("✅ Imagens enviadas:", uploadedNewImages);

      const finalImages = [...existingImages, ...uploadedNewImages]
        .map((img, i) => ({
          url: "url" in img ? img.url : img.image_url,
          order: i,
        }))
        .sort((a, b) => a.order - b.order);

      console.log("🎯 Imagens finais:", finalImages);

      const pieceData = {
        name: values.name,
        category_id: values.category_id,
        status: values.status,
        image_url: finalImages.length > 0 ? finalImages[0].url : null,
        images: finalImages,
        image_position_x: imagePositionX,
        image_position_y: imagePositionY,
        image_zoom: imageZoom,
        description: values.description || null,
        measurements:
          values.measurements &&
          Object.keys(values.measurements).some(
            (key) => values.measurements?.[key]
          )
            ? values.measurements
            : null,
      };

      console.log("📦 Dados da peça a ser salva:", pieceData);

      let response: Response;

      if (editingPiece) {
        console.log("✏️ Atualizando peça existente:", editingPiece.id);
        response = await fetch(`${PIECES_URL}/${editingPiece.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pieceData),
        });
      } else {
        console.log("➕ Criando nova peça");
        response = await fetch(PIECES_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pieceData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erro na resposta:", errorData);
        throw new Error(
          errorData.message || "Erro desconhecido ao salvar peça"
        );
      }

      const savedPiece = await response.json();
      console.log("✅ Peça salva com sucesso:", savedPiece);

      toast.success(
        `Peça ${editingPiece ? "atualizada" : "adicionada"} com sucesso!`
      );

      setIsDialogOpen(false);
      setEditingPiece(null);
      setProductImages([]);
      setImagePositionX(50);
      setImagePositionY(50);
      setImageZoom(100);
      form.reset();
      fetchPieces();
    } catch (error) {
      console.error("❌ Erro ao salvar peça:", error);
      toast.error(
        "Erro ao salvar peça: " +
          (error instanceof Error ? error.message : "Verifique o console.")
      );
    } finally {
      setUploading(false);
    }
  };

  const toggleStatus = async (piece: Piece) => {
    try {
      const response = await fetch(`${PIECES_URL}/${piece.id}/toggle-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: piece.status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao alterar status");
      }

      const newStatus = piece.status === "available" ? "rented" : "available";
      const statusText = newStatus === "available" ? "disponível" : "alugada";
      toast.success(`Peça marcada como ${statusText}`);
      fetchPieces();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erro ao alterar status");
    }
  };

  const deletePiece = async (piece: Piece) => {
    try {
      const response = await fetch(`${PIECES_URL}/${piece.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao excluir peça");
      }

      toast.success(`Peça "${piece.name}" removida do catálogo`);
      fetchPieces();
    } catch (error) {
      console.error("Error deleting piece:", error);
      toast.error("Erro ao excluir peça");
    }
  };

  const openEditDialog = (piece: Piece) => {
    setEditingPiece(piece);

    const existingImages: ProductImage[] =
      piece.images && (piece.images as Array<any>).length > 0
        ? (piece.images as Array<any>).map((img) => ({
            image_url: img.url,
            order: img.order,
            isNew: false,
          }))
        : piece.image_url
        ? [{ image_url: piece.image_url, order: 0, isNew: false }]
        : [];

    setProductImages(existingImages);
    setImagePositionX(piece.image_position_x ?? 50);
    setImagePositionY(piece.image_position_y ?? 50);
    setImageZoom(piece.image_zoom ?? 100);

    form.reset({
      name: piece.name,
      category_id: piece.category_id,
      status: piece.status,
      description: piece.description || "",
      measurements: piece.measurements || {
        busto: "",
        cintura: "",
        quadril: "",
        comprimento: "",
        tamanho: "",
      },
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingPiece(null);
    setProductImages([]);
    setImagePositionX(50);
    setImagePositionY(50);
    setImageZoom(100);
    form.reset({
      name: "",
      category_id: "",
      status: "available",
      description: "",
      measurements: {
        busto: "",
        cintura: "",
        quadril: "",
        comprimento: "",
        tamanho: "",
      },
    });
    setIsDialogOpen(true);
  };

  const filteredPieces = pieces.filter(
    (piece) =>
      piece.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      piece.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">
            Gestão de Peças
          </h1>
          <p className="text-muted-foreground font-montserrat">
            Gerencie todas as peças do seu catálogo
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openAddDialog}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark font-montserrat"
            >
              <Plus className="w-4 h-4" />
              Adicionar Peça
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-playfair">
                {editingPiece ? "Editar Peça" : "Nova Peça"}
              </DialogTitle>
              <DialogDescription className="font-montserrat">
                {editingPiece
                  ? "Atualize os dados da peça."
                  : "Adicione uma nova peça ao catálogo."}
              </DialogDescription>
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
                      <FormLabel className="font-montserrat">
                        Nome da Peça
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome da peça"
                          {...field}
                          className="font-montserrat"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-montserrat">
                        Categoria
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="font-montserrat">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                              className="font-montserrat"
                            >
                              {category.name}
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
                      <FormLabel className="font-montserrat">Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="font-montserrat">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem
                            value="available"
                            className="font-montserrat"
                          >
                            Disponível
                          </SelectItem>
                          <SelectItem
                            value="rented"
                            className="font-montserrat"
                          >
                            Alugada
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <MultipleImageUpload
                    images={productImages}
                    onChange={setProductImages}
                    maxImages={10}
                  />
                </div>

                {productImages.length > 0 && productImages[0].image_url && (
                  <div className="space-y-2">
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
                      title="Ajuste do Enquadramento"
                      subtitle="Esta será a imagem principal da peça"
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-montserrat">
                        Descrição
                      </FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Descrição da peça..."
                          {...field}
                          className="font-montserrat min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-montserrat">Medidas</FormLabel>
                      <FormControl>
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
                              className="font-montserrat"
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
                              className="font-montserrat"
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
                              className="font-montserrat"
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
                              className="font-montserrat"
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
                            className="font-montserrat"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="font-montserrat"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading}
                    className="bg-primary hover:bg-primary-dark font-montserrat"
                  >
                    {uploading ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="luxury-card">
        <CardHeader>
          <CardTitle className="font-playfair">Catálogo de Peças</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar peças..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm font-montserrat"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-montserrat">Imagem</TableHead>
                <TableHead className="font-montserrat">Nome</TableHead>
                <TableHead className="font-montserrat">Categoria</TableHead>
                <TableHead className="font-montserrat">Status</TableHead>
                <TableHead className="text-right font-montserrat">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPieces.map((piece) => (
                <TableRow key={piece.id}>
                  <TableCell>
                    {(() => {
                      const firstImage =
                        piece.images && (piece.images as Array<any>).length > 0
                          ? (piece.images as Array<any>).sort(
                              (a, b) => a.order - b.order
                            )[0]
                          : null;
                      const imageUrl = firstImage?.url || piece.image_url;

                      return imageUrl ? (
                        <div className="relative">
                          <img
                            src={imageUrl}
                            alt={piece.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          {piece.images &&
                            (piece.images as Array<any>).length > 1 && (
                              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {(piece.images as Array<any>).length}
                              </div>
                            )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="font-medium font-montserrat">
                    {piece.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-montserrat">
                      {piece.category?.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        piece.status === "available" ? "default" : "destructive"
                      }
                      className="font-montserrat"
                    >
                      {piece.status === "available" ? "Disponível" : "Alugada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="font-montserrat">
                          Ações
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => openEditDialog(piece)}
                          className="font-montserrat"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleStatus(piece)}
                          className="font-montserrat"
                        >
                          {piece.status === "available" ? (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Marcar como Alugada
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Marcar como Disponível
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deletePiece(piece)}
                          className="text-destructive font-montserrat"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
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
                    className="text-center py-8 text-muted-foreground font-montserrat"
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
