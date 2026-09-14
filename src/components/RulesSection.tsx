import React, { useState, useEffect } from "react";
import {
  Clock,
  Shield,
  Truck,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Heart,
  Calendar,
  Star,
  Info,
  FileText,
  ShoppingBag,
  Award,
  Tag,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import ContactChannels from "@/components/ContactChannels";
import { API_URL, isRemoteProductionHost } from "@/config/api";
import { useSiteContent } from "@/contexts/SiteContentContext";
import {
  RuleItem,
  RulesSettings,
  defaultRules,
  defaultRulesSettings,
} from "@/data/defaultRules";

const iconMap: Record<string, LucideIcon> = {
  clock: Clock,
  truck: Truck,
  shield: Shield,
  creditcard: CreditCard,
  "credit-card": CreditCard,
  checkcircle: CheckCircle,
  "check-circle": CheckCircle,
  alertcircle: AlertCircle,
  "alert-circle": AlertCircle,
  sparkles: Sparkles,
  heart: Heart,
  calendar: Calendar,
  star: Star,
  info: Info,
  filetext: FileText,
  "file-text": FileText,
  shoppingbag: ShoppingBag,
  "shopping-bag": ShoppingBag,
  award: Award,
  tag: Tag,
  helpcircle: HelpCircle,
  "help-circle": HelpCircle,
};

const renderIcon = (iconName: string) => {
  const normalized = (iconName || "").toLowerCase().trim();
  const Component = iconMap[normalized] || Shield;
  return <Component className="w-8 h-8" />;
};

const RulesSection = () => {
  const { content } = useSiteContent();
  const rulesContent = content.rules;

  const [rules, setRules] = useState<RuleItem[]>(() => {
    try {
      const cached = localStorage.getItem("looksdehoje_rules_data");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.rules) && parsed.rules.length > 0) {
          return parsed.rules
            .filter((r: RuleItem) => r.is_active !== false)
            .sort((a: RuleItem, b: RuleItem) => (a.order || 0) - (b.order || 0));
        }
      }
    } catch {
      // ignore
    }
    return defaultRules;
  });

  const [settings, setSettings] = useState<RulesSettings>(() => {
    try {
      const cached = localStorage.getItem("looksdehoje_rules_data");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.settings) {
          return { ...defaultRulesSettings, ...parsed.settings };
        }
      }
    } catch {
      // ignore
    }
    return {
      title: rulesContent?.section_title || defaultRulesSettings.title,
      subtitle: rulesContent?.section_subtitle || defaultRulesSettings.subtitle,
      support_title: rulesContent?.support_title || defaultRulesSettings.support_title,
      support_description: rulesContent?.support_description || defaultRulesSettings.support_description,
      support_message: defaultRulesSettings.support_message,
    };
  });

  // Atualizar quando o content global mudar
  useEffect(() => {
    if (rulesContent) {
      setSettings((prev) => ({
        ...prev,
        title: rulesContent.section_title || prev.title,
        subtitle: rulesContent.section_subtitle || prev.subtitle,
        support_title: rulesContent.support_title || prev.support_title,
        support_description: rulesContent.support_description || prev.support_description,
      }));
    }
  }, [rulesContent]);

  useEffect(() => {
    const fetchRules = async () => {
      // If we already know the server doesn't support /rules or we are on production without the route, skip the 404 fetch
      const cachedSupport = localStorage.getItem("looksdehoje_rules_server_supported");
      if (cachedSupport === "false" || isRemoteProductionHost()) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/rules`);
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setSettings((prev) => ({ ...prev, ...data.settings }));
          }
          if (Array.isArray(data.rules) && data.rules.length > 0) {
            const activeRules = data.rules
              .filter((r: RuleItem) => r.is_active !== false)
              .sort((a: RuleItem, b: RuleItem) => (a.order || 0) - (b.order || 0));
            setRules(activeRules);
          }
          try {
            localStorage.setItem("looksdehoje_rules_data", JSON.stringify(data));
          } catch {
            // ignore
          }
          localStorage.setItem("looksdehoje_rules_server_supported", "true");
        } else if (response.status === 404) {
          localStorage.setItem("looksdehoje_rules_server_supported", "false");
          console.info(
            "Endpoint /api/rules não encontrado no servidor (404). Exibindo regras locais configuradas."
          );
        }
      } catch {
        // Fallback already in place
      }
    };

    fetchRules();
  }, []);

  return (
    <section id="regras" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            {settings.title}
          </h2>
          <p className="font-montserrat text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {settings.subtitle}
          </p>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-fade-in">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="luxury-card hover-lift group p-6 sm:p-8 text-center"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-secondary/40 text-primary mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                {renderIcon(rule.icon)}
              </div>

              {/* Title */}
              <h3 className="font-playfair text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 group-hover:text-primary transition-colors">
                {rule.title}
              </h3>

              {/* Description */}
              <p className="font-montserrat text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6 leading-relaxed">
                {rule.description}
              </p>

              {/* Details */}
              {rule.details && rule.details.length > 0 && (
                <ul className="space-y-2.5">
                  {rule.details.map((detail, detailIndex) => (
                    <li 
                      key={detailIndex}
                      className="font-montserrat text-xs sm:text-sm text-muted-foreground flex items-start text-left sm:items-center sm:justify-center"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2.5 mt-1.5 sm:mt-0 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-2xl bg-secondary/30 border border-primary/20">
          <div className="text-center max-w-4xl mx-auto">
            <h3 className="font-playfair text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">
              {settings.support_title}
            </h3>
            <p className="font-montserrat text-sm sm:text-base text-muted-foreground mb-6">
              {settings.support_description}
            </p>
            <ContactChannels 
              message={settings.support_message || "Olá! Tenho dúvidas sobre as regras de aluguel."}
              size="md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RulesSection;