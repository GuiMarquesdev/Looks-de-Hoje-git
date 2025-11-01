"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaHeroSettingRepository = void 0;
const HERO_SETTINGS_ID = "hero";
class PrismaHeroSettingRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings() {
        return this.prisma.heroSetting.findUnique({
            where: { id: HERO_SETTINGS_ID },
        });
    }
    async getSlides(settingId) {
        const settings = await this.getSettings();
        if (settings &&
            settings.slides &&
            Array.isArray(settings.slides)) {
            // Mapeia o JSON para HeroSlideData
            return settings.slides;
        }
        return [];
    }
    async updateSettings(data) {
        return this.prisma.heroSetting.update({
            where: { id: HERO_SETTINGS_ID },
            data: {
                is_active: data.is_active,
                interval_ms: data.interval_ms,
                background_image_url: data.background_image_url,
            },
        });
    }
    async updateHeroData(data) {
        const slidesDataJson = data.slides.map((slide) => ({
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
                slides: slidesDataJson,
                background_image_url: data.background_image_url,
            },
            create: {
                id: HERO_SETTINGS_ID,
                is_active: data.is_active,
                interval_ms: data.interval_ms,
                slides: slidesDataJson,
                background_image_url: data.background_image_url,
            },
        });
    }
}
exports.PrismaHeroSettingRepository = PrismaHeroSettingRepository;
//# sourceMappingURL=PrismaHeroSettingRepository.js.map