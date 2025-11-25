import { HeroSetting } from "@prisma/client"; // 🚨 CORREÇÃO: Usar HeroSetting (O nome do modelo principal)
import { IHeroSettingRepository } from "../interfaces/IHeroSettingRepository";
// 🚨 CORREÇÃO: Usar o DTO correto que existe no common/types.ts
import { HeroSettingsDTO } from "../common/types";

// Assumindo que o tipo HeroSlide está definido na interface do repositório ou não é usado diretamente aqui
interface HeroSlide {
  /* ... */
} // Pode ser importado da interface IHeroSettingRepository se definido lá

export class HeroService {
  constructor(private heroSettingRepository: IHeroSettingRepository) {}

  // 🚨 CORREÇÃO: Ajustar o tipo de retorno e usar o método atualizado do repositório
  async getSettingsAndSlides(): Promise<{
    settings: HeroSetting | null;
    slides: HeroSlide[];
  }> {
    // 1. Busca as configurações (HeroSetting)
    const settings = await this.heroSettingRepository.getSettings();

    // 2. Chama getSlides com o ID da configuração
    const slides = settings
      ? await this.heroSettingRepository.getSlides(settings.id)
      : [];

    // 3. Retorna a combinação
    return { settings, slides };
  }

  async updateSettings(data: Partial<HeroSettingsDTO>): Promise<HeroSetting> {
    return this.heroSettingRepository.updateSettings(data);
  }
}
