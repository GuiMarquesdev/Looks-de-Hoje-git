import { MapPin, Phone, Instagram, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactChannels from "@/components/ContactChannels";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";
import { useSiteContent } from "@/contexts/SiteContentContext";

const ContactSection = () => {
  const { settings, getWhatsAppUrl, getInstagramUrl, getDisplayPhone, getDisplayInstagram } =
    useStoreSettings();
  const { content } = useSiteContent();
  const contactText = content.contact;

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: contactText.whatsapp_card_title || "WhatsApp",
      info: getDisplayPhone(),
      action: () => window.open(getWhatsAppUrl(), "_blank"),
      actionText: contactText.whatsapp_card_btn || "Chamar no WhatsApp",
    },
    {
      icon: <Instagram className="w-6 h-6" />,
      title: contactText.instagram_card_title || "Instagram",
      info: getDisplayInstagram(),
      action: () => window.open(getInstagramUrl(), "_blank"),
      actionText: contactText.instagram_card_btn || "Seguir no Instagram",
    },
  ];

  const workingHours = [
    {
      day: "Horário",
      hours: settings.working_hours || "Segunda, Quarta e Sexta: 12:00 - 18:00 (Com agendamento)",
    },
    { day: "Atendimento", hours: contactText.hours_badge || "Somente com agendamento prévio" },
  ];

  // Endereço completo para o link de pesquisa
  const fullAddress =
    settings.address ||
    "Av. Antônio Carlos Magalhães, 2501 - Itaigara, Salvador - BA, 40280-901";
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullAddress
  )}`;

  // Link de incorporação do Google Maps para o iframe (sincronizado com o endereço dinâmico)
  const mapsEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    fullAddress
  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="contato" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            {contactText.section_title || "Contato & Localização"}
          </h2>
          <p className="font-montserrat text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {contactText.section_subtitle ||
              "Entre em contato conosco ou visite nossa loja física. Estamos prontas para ajudar você a encontrar o look perfeito."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8">
            {/* Contact Cards */}
            <div className="grid gap-4 sm:gap-6">
              {contactInfo.map((contact, index) => (
                <div
                  key={index}
                  className="luxury-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover-lift group"
                >
                  <div className="flex-shrink-0 text-primary group-hover:scale-110 transition-transform duration-300">
                    {contact.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-playfair text-lg font-semibold text-foreground mb-1">
                      {contact.title}
                    </h3>
                    <p className="font-montserrat text-sm sm:text-base text-muted-foreground mb-3 break-all">
                      {contact.info}
                    </p>
                    <Button
                      size="sm"
                      onClick={contact.action}
                      className="bg-gradient-gold hover:bg-primary-dark text-primary-foreground font-montserrat font-medium px-4 py-2 rounded-full shadow-gold transition-all duration-300"
                    >
                      {contact.actionText}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Working Hours */}
            <div className="luxury-card p-5 sm:p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-3 shrink-0" />
                <h3 className="font-playfair text-lg sm:text-xl font-semibold text-foreground">
                  {contactText.hours_title || "Horário de Funcionamento"}
                </h3>
              </div>
              <div className="space-y-3">
                {workingHours.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 py-1.5 border-b border-border/40 last:border-0"
                  >
                    <span className="font-montserrat text-xs sm:text-sm text-muted-foreground font-medium">
                      {schedule.day}
                    </span>
                    <span className="font-montserrat text-xs sm:text-sm font-semibold text-foreground sm:text-right">
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map and Address */}
          <div className="space-y-6">
            {/* Address Card */}
            <div className="luxury-card p-5 sm:p-6">
              <div className="flex items-start mb-4">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-playfair text-lg sm:text-xl font-semibold text-foreground mb-2">
                    {contactText.store_title || "Nossa Loja"}
                  </h3>
                  <address className="font-montserrat text-sm sm:text-base text-muted-foreground not-italic leading-relaxed">
                    {fullAddress}
                  </address>
                </div>
              </div>
              <Button
                className="w-full bg-gradient-gold hover:bg-primary-dark text-primary-foreground font-montserrat font-semibold py-3 rounded-full shadow-gold transition-all duration-300 touch-manipulation cursor-pointer"
                // Link de pesquisa corrigido
                onClick={() => window.open(mapsSearchUrl, "_blank")}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {contactText.maps_btn_text || "Ver no Google Maps"}
              </Button>
            </div>

            {/* MAPA INTERATIVO CORRIGIDO (Embed) */}
            <div className="luxury-card overflow-hidden h-72 sm:h-80">
              <iframe
                src={mapsEmbedSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                // allowFullScreen no formato correto (camelCase)
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da Loja"
              ></iframe>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="luxury-card p-6 sm:p-8 max-w-2xl mx-auto">
            <h3 className="font-playfair text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">
              Pronta para alugar seu próximo look?
            </h3>
            <p className="font-montserrat text-sm sm:text-base text-muted-foreground mb-6">
              Entre em contato conosco agora mesmo e descubra como é fácil
              alugar roupas incríveis para suas ocasiões especiais.
            </p>
            <ContactChannels
              message="Olá! Gostaria de alugar uma roupa para uma ocasião especial."
              size="md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
