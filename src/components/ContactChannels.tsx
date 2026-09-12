import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import whatsappIcon from "@/assets/whatsapp-icon.svg";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";

interface ContactChannelsProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "compact";
  message?: string;
  productName?: string;
}

const ContactChannels = ({
  className = "",
  size = "md",
  variant = "default",
  message,
  productName,
}: ContactChannelsProps) => {
  const { getWhatsAppUrl, getInstagramUrl, settings } = useStoreSettings();

  const getWhatsAppMessage = () => {
    if (message) return message;
    if (productName)
      return `Olá! Gostaria de alugar o ${productName} do ${settings.store_name || "LooksdeHoje"}. Poderia me dar mais informações?`;
    return `Olá! Gostaria de saber mais sobre o aluguel de peças do ${settings.store_name || "LooksdeHoje"}.`;
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
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3",
    lg: "px-6 py-4 text-lg",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const containerClasses = {
    default: "flex flex-col sm:flex-row gap-3 justify-center",
    outline: "flex flex-col sm:flex-row gap-3 justify-center",
    compact: "flex gap-2 justify-center",
  };

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {/* WhatsApp Button */}
      <Button
        id="contact-channel-whatsapp"
        onClick={handleWhatsApp}
        className={`${buttonSizeClasses[size]} bg-emerald-600 hover:bg-emerald-700 text-white font-montserrat font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-md border-0 ring-0 outline-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0`}
      >
        <img
          src={whatsappIcon}
          alt="WhatsApp"
          className={`${iconSizeClasses[size]} mr-2`}
        />
        {variant === "compact" ? "" : "WhatsApp"}
      </Button>

      {/* Instagram Button */}
      <Button
        id="contact-channel-instagram"
        onClick={handleInstagram}
        className={`${buttonSizeClasses[size]} bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-montserrat font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-md border-0 ring-0 outline-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0`}
      >
        <Instagram className={`${iconSizeClasses[size]} mr-2`} />
        {variant === "compact" ? "" : "Instagram"}
      </Button>
    </div>
  );
};

export default ContactChannels;
