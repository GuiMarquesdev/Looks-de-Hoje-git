import { Instagram, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import whatsappIcon from "@/assets/whatsapp-icon.svg";

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
  productName
}: ContactChannelsProps) => {
  const whatsappNumber = "71992771527";
  const instagramUrl = "https://www.instagram.com/looksdehojebr";
  const email = "lookdehojebrecho@gmail.com";

  const getWhatsAppMessage = () => {
    if (message) return message;
    if (productName) return `Olá! Gostaria de alugar o ${productName} do LooksdeHoje. Poderia me dar mais informações?`;
    return "Olá! Gostaria de saber mais sobre o aluguel de peças do LooksdeHoje.";
  };

  const getEmailSubject = () => {
    if (productName) return `Interesse no aluguel - ${productName}`;
    return "Contato - LooksdeHoje";
  };

  const getEmailBody = () => {
    if (productName) return `Olá! Gostaria de alugar a peça "${productName}". Poderia me dar mais informações?`;
    return "Olá! Gostaria de saber mais sobre o aluguel de peças.";
  };

  const handleWhatsApp = () => {
    const whatsappMessage = encodeURIComponent(getWhatsAppMessage());
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, "_blank");
  };

  const handleInstagram = () => {
    window.open(instagramUrl, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(getEmailSubject());
    const body = encodeURIComponent(getEmailBody());
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  };

  const buttonSizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3",
    lg: "px-6 py-4 text-lg"
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  const containerClasses = {
    default: "flex flex-col sm:flex-row gap-3 justify-center",
    outline: "flex flex-col sm:flex-row gap-3 justify-center",
    compact: "flex gap-2 justify-center"
  };

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {/* WhatsApp Button */}
      <Button
        onClick={handleWhatsApp}
        className={`${buttonSizeClasses[size]} bg-green-600 hover:bg-green-700 text-white font-montserrat font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-lg`}
      >
        <img src={whatsappIcon} alt="WhatsApp" className={`${iconSizeClasses[size]} mr-2`} />
        {variant === "compact" ? "" : "WhatsApp"}
      </Button>

      {/* Instagram Button */}
      <Button
        onClick={handleInstagram}
        className={`${buttonSizeClasses[size]} bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-montserrat font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-lg`}
      >
        <Instagram className={`${iconSizeClasses[size]} mr-2`} />
        {variant === "compact" ? "" : "Instagram"}
      </Button>

      {/* Email Button */}
      <Button
        onClick={handleEmail}
        className={`${buttonSizeClasses[size]} bg-gradient-gold hover:bg-primary-dark text-primary-foreground font-montserrat font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-gold`}
      >
        <Mail className={`${iconSizeClasses[size]} mr-2`} />
        {variant === "compact" ? "" : "E-mail"}
      </Button>
    </div>
  );
};

export default ContactChannels;