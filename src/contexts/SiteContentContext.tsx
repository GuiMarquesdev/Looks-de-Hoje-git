import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { API_URL } from "@/config/api";
import { SiteContent, defaultSiteContent } from "@/types/siteContent";

interface SiteContentContextType {
  content: SiteContent;
  loading: boolean;
  refreshContent: () => Promise<void>;
  updateContent: (newContent: Partial<SiteContent>) => Promise<boolean>;
}

const SiteContentContext = createContext<SiteContentContextType>({
  content: defaultSiteContent,
  loading: false,
  refreshContent: async () => {},
  updateContent: async () => false,
});

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [loading, setLoading] = useState(true);

  const refreshContent = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/site-content`);
      if (response.ok) {
        const data = await response.json();
        setContent({
          header: { ...defaultSiteContent.header, ...(data.header || {}) },
          collection: { ...defaultSiteContent.collection, ...(data.collection || {}) },
          rules: { ...defaultSiteContent.rules, ...(data.rules || {}) },
          contact: { ...defaultSiteContent.contact, ...(data.contact || {}) },
          footer: { ...defaultSiteContent.footer, ...(data.footer || {}) },
        });
      }
    } catch (error) {
      console.warn("Não foi possível carregar conteúdo dinâmico, usando defaults:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  const updateContent = async (newContent: Partial<SiteContent>): Promise<boolean> => {
    try {
      const response = await api.put("/site-content", newContent);
      if (response.data) {
        setContent({
          header: { ...defaultSiteContent.header, ...(response.data.header || {}) },
          collection: { ...defaultSiteContent.collection, ...(response.data.collection || {}) },
          rules: { ...defaultSiteContent.rules, ...(response.data.rules || {}) },
          contact: { ...defaultSiteContent.contact, ...(response.data.contact || {}) },
          footer: { ...defaultSiteContent.footer, ...(response.data.footer || {}) },
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao salvar conteúdo do site:", error);
      return false;
    }
  };

  return (
    <SiteContentContext.Provider
      value={{
        content,
        loading,
        refreshContent,
        updateContent,
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => useContext(SiteContentContext);
