"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroService = void 0;
class HeroService {
    constructor(heroSettingRepository) {
        this.heroSettingRepository = heroSettingRepository;
    }
    // 🚨 CORREÇÃO: Ajustar o tipo de retorno e usar o método atualizado do repositório
    async getSettingsAndSlides() {
        // 1. Busca as configurações (HeroSetting)
        const settings = await this.heroSettingRepository.getSettings();
        // 2. Chama getSlides com o ID da configuração
        const slides = settings
            ? await this.heroSettingRepository.getSlides(settings.id)
            : [];
        // 3. Retorna a combinação
        return { settings, slides };
    }
    async updateSettings(data) {
        return this.heroSettingRepository.updateSettings(data);
    }
}
exports.HeroService = HeroService;
//# sourceMappingURL=HeroService.js.map