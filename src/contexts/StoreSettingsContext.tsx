import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/config/api";

export interface StoreSettings {
  id?: string;
  store_name: string;
  instagram_url: string;
  whatsapp_url: string;
  email: string;
  phone?: string;
  address?: string;
  working_hours?: string;
}

interface StoreSettingsContextType {
  settings: StoreSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  getWhatsAppUrl: (message?: string) => string;
  getInstagramUrl: () => string;
  getDisplayPhone: () => string;
  getDisplayInstagram: () => string;
}

const defaultSettings: StoreSettings = {
  store_name: "Looks de Hoje",
  instagram_url: "https://www.instagram.com/looksdehojebrecho/",
  whatsapp_url: "https://wa.me/5571992771527",
  email: "contato@looksdehoje.com.br",
  phone: "(71) 99277-1527",
  address: "Av. Antônio Carlos Magalhães, 2501 - Brotas, Salvador - BA, 40280-901",
  working_hours: "Segunda, Quarta e Sexta: 12:00 - 18:00 (Somente com agendamento)",
};

const StoreSettingsContext = createContext<StoreSettingsContextType>({
  settings: defaultSettings,
  loading: false,
  refreshSettings: async () => {},
  getWhatsAppUrl: () => "https://wa.me/5571992771527",
  getInstagramUrl: () => "https://www.instagram.com/looksdehojebrecho/",
  getDisplayPhone: () => "(71) 99277-1527",
  getDisplayInstagram: () => "@looksdehojebrecho",
});

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const cached = localStorage.getItem("looksdehoje_store_settings");
      if (cached) {
        return { ...defaultSettings, ...JSON.parse(cached) };
      }
    } catch {
      // ignore
    }
    return defaultSettings;
  });
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const response = await api.get<StoreSettings>("/settings");
      if (response.data) {
        const merged = {
          ...defaultSettings,
          ...response.data,
        };
        setSettings(merged);
        try {
          localStorage.setItem("looksdehoje_store_settings", JSON.stringify(merged));
        } catch {
          // ignore
        }
      }
    } catch (error) {
      console.warn("Could not fetch store settings, using cached/defaults:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Helper to extract clean phone digits from raw string or URL
  const extractDigits = (val: string): string => {
    if (!val) return "";
    return val.replace(/\D/g, "");
  };

  const getWhatsAppUrl = useCallback(
    (message?: string): string => {
      const raw = settings.whatsapp_url?.trim() || "";
      const textParam = message ? `?text=${encodeURIComponent(message)}` : "";

      if (!raw) {
        return `https://wa.me/5571992771527${textParam}`;
      }

      // If already a full URL
      if (raw.startsWith("http://") || raw.startsWith("https://")) {
        try {
          const url = new URL(raw);
          // If a custom message was passed, update or set the query param
          if (message) {
            url.searchParams.set("text", message);
            return url.toString();
          }
          return raw;
        } catch {
          // Fall through to regex extraction
        }
      }

      let digits = extractDigits(raw);
      if (digits.length === 10 || digits.length === 11) {
        digits = `55${digits}`;
      }

      if (!digits) {
        digits = "5571992771527";
      }

      return `https://wa.me/${digits}${textParam}`;
    },
    [settings.whatsapp_url]
  );

  const getInstagramUrl = useCallback((): string => {
    const raw = settings.instagram_url?.trim() || "";
    if (!raw) return "https://www.instagram.com/looksdehojebrecho/";
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }
    const cleanHandle = raw.replace(/^@/, "").replace(/\/$/, "");
    return `https://www.instagram.com/${cleanHandle}/`;
  }, [settings.instagram_url]);

  const getDisplayPhone = useCallback((): string => {
    if (settings.phone?.trim()) {
      return settings.phone.trim();
    }
    const raw = settings.whatsapp_url || "";
    const digits = extractDigits(raw);
    // Format standard Brazilian phone (55 71 992771527 or 71 992771527)
    const local = digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;
    if (local.length === 11) {
      return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
    }
    if (local.length === 10) {
      return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
    }
    return "(71) 99277-1527";
  }, [settings.phone, settings.whatsapp_url]);

  const getDisplayInstagram = useCallback((): string => {
    const raw = settings.instagram_url?.trim() || "";
    if (!raw) return "@looksdehojebrecho";
    try {
      if (raw.startsWith("http://") || raw.startsWith("https://")) {
        const url = new URL(raw);
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length > 0) {
          return `@${parts[0]}`;
        }
      }
    } catch {
      // ignore
    }
    const cleanHandle = raw.replace(/^@/, "").replace(/\/$/, "");
    return cleanHandle ? `@${cleanHandle}` : "@looksdehojebrecho";
  }, [settings.instagram_url]);

  return (
    <StoreSettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings,
        getWhatsAppUrl,
        getInstagramUrl,
        getDisplayPhone,
        getDisplayInstagram,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => useContext(StoreSettingsContext);
