// backend/src/interfaces/IHeroSettingRepository.ts

import { HeroSetting } from "@prisma/client";
import { HeroSettingsDTO } from "../common/types";

interface HeroSlideData {
  id?: string;
  image_url: string;
  order: number;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
}

// Definição do Payload completo que a rota envia
export interface HeroUpdatePayload extends Partial<HeroSettingsDTO> {
  slides: HeroSlideData[];
}

export interface IHeroSettingRepository {
  getSettings(): Promise<HeroSetting | null>;

  updateSettings(data: Partial<HeroSettingsDTO>): Promise<HeroSetting>;

  // Usar HeroSlideData no retorno
  getSlides(settingId: string): Promise<HeroSlideData[]>;

  updateHeroData(data: HeroUpdatePayload): Promise<HeroSetting>;
}

export { HeroSlideData };
