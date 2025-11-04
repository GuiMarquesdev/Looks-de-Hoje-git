// backend/src/common/types.ts

// DTO para as informações de configuração da loja
export interface StoreSettingsDTO {
  store_name: string;
  instagram_url?: string;
  whatsapp_url?: string;
  email?: string;
}

// DTO para a alteração de senha
export interface ChangePasswordDTO {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// DTO para a criação de uma nova peça
export interface CreatePieceDTO {
  title: string;
  name: string;
  description?: string;
  price: number;
  is_available: boolean;
  category_id: string;
  image_urls: string[];
}

// DTO para atualizar uma peça existente
export interface UpdatePieceDTO {
  title?: string;
  name?: string;
  description?: string;
  price?: number;
  is_available?: boolean;
  category_id?: string;
  image_urls?: string[];
}

// DTO para a criação de Categoria
export interface CreateCategoryDTO {
  name: string;
  slug: string;
  is_active: boolean;
}

// DTO para a atualização de Categoria
export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  is_active?: boolean;
}

// DTO para a criação/atualização das configurações do Hero (banner)
export interface HeroSettingsDTO {
  id: string;
  // CORREÇÃO: Adicionando 'null' para compatibilidade com o retorno do Prisma
  title?: string | null;
  subtitle?: string | null;
  cta_text?: string | null;
  cta_link?: string | null;
  // background_image_url também é nulo no banco se não definido.
  background_image_url?: string | null;
  is_active: boolean;
  interval_ms: number;
}
