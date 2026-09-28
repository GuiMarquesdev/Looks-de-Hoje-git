import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";

interface ContactChannelsProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "compact";
  theme?: "gold" | "black" | "black-gold";
  message?: string;
  productName?: string;
}

export const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ContactChannels = ({
  className = "",
  size = "md",
  variant = "default",
  theme,
  message,
  productName,
}: ContactChannelsProps) => {
  const { getWhatsAppUrl, getInstagramUrl, settings } = useStoreSettings();

  // Active theme: property override or store settings or default "gold"
  const activeTheme = theme || settings.channels_theme || "gold";

  const getWhatsAppMessage = () => {
    if (message) return message;
    if (productName)
      return `Olá! Gostaria de alugar o ${productName} do ${settings.store_name || "Look de Hoje"}. Poderia me dar mais informações?`;
    return `Olá! Gostaria de saber mais sobre o aluguel de peças do ${settings.store_name || "Look de Hoje"}.`;
  };

  const handleWhatsApp = () => {
    const url = getWhatsAppUrl(getWhatsAppMessage());
    window.open(url, "_blank");
  };

  const handleInstagram = () => {
    const url = getInstagramUrl();
    window.open(url, "_blank");
  };

  const buttonSizeClasses = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-4.5 h-4.5",
    lg: "w-5 h-5",
  };

  const containerClasses = {
    default: "flex flex-col sm:flex-row gap-3 justify-center items-center",
    outline: "flex flex-col sm:flex-row gap-3 justify-center items-center",
    compact: "flex gap-2 justify-center items-center",
  };

  // Luxury Gold & Black styling options
  const getThemeStyles = () => {
    if (activeTheme === "black") {
      // Both in Luxury Deep Black with gold highlights
      return {
        whatsapp:
          "bg-zinc-950 hover:bg-black text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 shadow-md hover:shadow-gold/20",
        instagram:
          "bg-zinc-950 hover:bg-black text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 shadow-md hover:shadow-gold/20",
      };
    }

    if (activeTheme === "black-gold") {
      // WhatsApp in Gold Gradient, Instagram in Luxury Deep Black
      return {
        whatsapp:
          "bg-gradient-gold hover:bg-primary-dark text-primary-foreground border border-amber-400/40 shadow-gold hover:shadow-gold/60",
        instagram:
          "bg-zinc-950 hover:bg-black text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 shadow-md hover:shadow-gold/20",
      };
    }

    // Default: "gold" (Padrão Dourado Luxuoso)
    return {
      whatsapp:
        "bg-gradient-gold hover:bg-primary-dark text-primary-foreground border border-amber-400/40 shadow-gold hover:shadow-gold/60",
      instagram:
        "bg-gradient-gold hover:bg-primary-dark text-primary-foreground border border-amber-400/40 shadow-gold hover:shadow-gold/60",
    };
  };

  const themeStyles = getThemeStyles();

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {/* WhatsApp Button */}
      <Button
        id="contact-channel-whatsapp"
        onClick={handleWhatsApp}
        className={`${buttonSizeClasses[size]} ${themeStyles.whatsapp} font-montserrat font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 ring-0 outline-none cursor-pointer flex items-center justify-center`}
      >
        <WhatsAppIcon className={`${iconSizeClasses[size]} mr-2 shrink-0`} />
        <span>{variant === "compact" ? "" : "WhatsApp"}</span>
      </Button>

      {/* Instagram Button */}
      <Button
        id="contact-channel-instagram"
        onClick={handleInstagram}
        className={`${buttonSizeClasses[size]} ${themeStyles.instagram} font-montserrat font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 ring-0 outline-none cursor-pointer flex items-center justify-center`}
      >
        <Instagram className={`${iconSizeClasses[size]} mr-2 shrink-0`} />
        <span>{variant === "compact" ? "" : "Instagram"}</span>
      </Button>
    </div>
  );
};

export default ContactChannels;
