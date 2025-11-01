import { PrismaClient, HeroSetting } from "@prisma/client";
import {
  IHeroSettingRepository,
  HeroUpdatePayload,
  HeroSlideData,
} from "../interfaces/IHeroSettingRepository";
import { HeroSettingsDTO } from "../common/types";

const HERO_SETTINGS_ID = "hero";

export class PrismaHeroSettingRepository implements IHeroSettingRepository {
  constructor(private prisma: PrismaClient) {}

  async getSettings(): Promise<HeroSetting | null> {
    return this.prisma.heroSetting.findUnique({
      where: { id: HERO_SETTINGS_ID },
    });
  }

  async getSlides(settingId: string): Promise<HeroSlideData[]> {
    const settings = await this.getSettings();
    if (
      settings &&
      (settings as any).slides &&
      Array.isArray((settings as any).slides)
    ) {
      // Mapeia o JSON para HeroSlideData
      return (settings as any).slides as HeroSlideData[];
    }
    return [];
  }

  async updateSettings(data: Partial<HeroSettingsDTO>): Promise<HeroSetting> {
    return this.prisma.heroSetting.update({
      where: { id: HERO_SETTINGS_ID },
      data: {
        is_active: data.is_active,
        interval_ms: data.interval_ms,

        background_image_url: data.background_image_url,
      },
    });
  }

  async updateHeroData(data: HeroUpdatePayload): Promise<HeroSetting> {
    const slidesDataJson = data.slides.map((slide: HeroSlideData) => ({
      image_url: slide.image_url,
      order: slide.order,

      title: slide.title,
      subtitle: slide.subtitle,
      cta_text: slide.cta_text,
      cta_link: slide.cta_link,
    }));

    // 2. Usa UPSERT para atualizar ou criar
    return this.prisma.heroSetting.upsert({
      where: { id: HERO_SETTINGS_ID },
      update: {
        is_active: data.is_active,
        interval_ms: data.interval_ms,
        slides: slidesDataJson as any,
        background_image_url: data.background_image_url,
      },
      create: {
        id: HERO_SETTINGS_ID,
        is_active: data.is_active,
        interval_ms: data.interval_ms,
        slides: slidesDataJson as any,
        background_image_url: data.background_image_url,
      },
    });
  }
}
