import { MapPin, Phone, Mail, Instagram, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactChannels from "@/components/ContactChannels";

const ContactSection = () => {
  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "WhatsApp",
      info: "(71) 99277-1527",
      action: () => window.open("https://wa.me/71992771527", "_blank"),
      actionText: "Chamar no WhatsApp"
    },
    {
      icon: <Instagram className="w-6 h-6" />,
      title: "Instagram",
      info: "@looksdehojebrecho",
      action: () => window.open("https://www.instagram.com/looksdehojebr", "_blank"),
      actionText: "Seguir no Instagram"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "E-mail",
      info: "lookdehojebrecho@gmail.com",
      action: () => window.open("mailto:lookdehojebrecho@gmail.com", "_blank"),
      actionText: "Enviar E-mail"
    }
  ];

  const workingHours = [
    { day: "Segunda, Quarta e Sexta", hours: "12:00 - 18:00" },
    { day: "Atendimento", hours: "Somente com agendamento" }
  ];

  return (
    <section id="contato" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-6">
            Contato & Localização
          </h2>
          <p className="font-montserrat text-lg text-muted-foreground max-w-2xl mx-auto">
            Entre em contato conosco ou visite nossa loja física. Estamos prontas para ajudar você a encontrar o look perfeito.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Cards */}
            <div className="grid gap-6">
              {contactInfo.map((contact, index) => (
                <div
                  key={index}
                  className="luxury-card p-6 flex items-center space-x-4 hover-lift group"
                >
                  <div className="flex-shrink-0 text-primary group-hover:scale-110 transition-transform duration-300">
                    {contact.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-playfair text-lg font-semibold text-foreground mb-1">
                      {contact.title}
                    </h3>
                    <p className="font-montserrat text-muted-foreground mb-3">
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
            <div className="luxury-card p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-primary mr-3" />
                <h3 className="font-playfair text-xl font-semibold text-foreground">
                  Horário de Funcionamento
                </h3>
              </div>
              <div className="space-y-3">
                {workingHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-montserrat text-muted-foreground">
                      {schedule.day}
                    </span>
                    <span className="font-montserrat font-semibold text-foreground">
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
            <div className="luxury-card p-6">
              <div className="flex items-start mb-4">
                <MapPin className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-playfair text-xl font-semibold text-foreground mb-2">
                    Nossa Loja
                  </h3>
                  <address className="font-montserrat text-muted-foreground not-italic leading-relaxed">
                    Av. Antônio Carlos Magalhães, 2501 - Brotas<br />
                    Salvador - BA, 40280-901
                  </address>
                </div>
              </div>
              <Button
                className="w-full bg-gradient-gold hover:bg-primary-dark text-primary-foreground font-montserrat font-semibold py-3 rounded-full shadow-gold transition-all duration-300"
                onClick={() => window.open("https://maps.google.com/?q=Av.+Antônio+Carlos+Magalhães+2501+Brotas+Salvador+BA", "_blank")}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Ver no Google Maps
              </Button>
            </div>

            {/* Map Placeholder */}
            <div className="luxury-card overflow-hidden h-80">
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center relative">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-playfair text-lg font-semibold text-foreground mb-2">
                    Localização
                  </h3>
                  <p className="font-montserrat text-sm text-muted-foreground">
                    Brotas, Salvador - BA
                  </p>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 w-8 h-8 border-2 border-primary/30 rounded-full animate-pulse" />
                <div className="absolute bottom-6 right-6 w-6 h-6 border-2 border-primary/50 rounded-full animate-pulse delay-300" />
                <div className="absolute top-1/3 right-8 w-4 h-4 border-2 border-primary/40 rounded-full animate-pulse delay-700" />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="luxury-card p-8 max-w-2xl mx-auto">
            <h3 className="font-playfair text-2xl font-semibold text-foreground mb-4">
              Pronta para alugar seu próximo look?
            </h3>
            <p className="font-montserrat text-muted-foreground mb-6">
              Entre em contato conosco agora mesmo e descubra como é fácil alugar roupas incríveis para suas ocasiões especiais.
            </p>
            <ContactChannels 
              message="Olá! Gostaria de alugar uma roupa para uma ocasião especial."
              size="lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;