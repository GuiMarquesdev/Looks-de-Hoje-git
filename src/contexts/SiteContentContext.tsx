import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { API_URL, isRemoteProductionHost } from "@/config/api";
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
  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const cached = localStorage.getItem("looksdehoje_site_content");
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          header: { ...defaultSiteContent.header, ...(parsed.header || {}) },
          collection: { ...defaultSiteContent.collection, ...(parsed.collection || {}) },
          rules: { ...defaultSiteContent.rules, ...(parsed.rules || {}) },
          contact: { ...defaultSiteContent.contact, ...(parsed.contact || {}) },
          footer: { ...defaultSiteContent.footer, ...(parsed.footer || {}) },
        };
      }
    } catch {
      // ignore
    }
    return defaultSiteContent;
  });
  const [loading, setLoading] = useState(true);

  const refreshContent = useCallback(async () => {
    try {
      // If on lookdehoje.com or already detected as unsupported (404), skip network call to keep console clean
      const isRemoteProduction = isRemoteProductionHost();
      const cachedSupport = localStorage.getItem("looksdehoje_site_content_server_supported");
      if (isRemoteProduction || cachedSupport === "false") {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/site-content`);
      if (response.ok) {
        const data = await response.json();
        const merged: SiteContent = {
          header: { ...defaultSiteContent.header, ...(data.header || {}) },
          collection: { ...defaultSiteContent.collection, ...(data.collection || {}) },
          rules: { ...defaultSiteContent.rules, ...(data.rules || {}) },
          contact: { ...defaultSiteContent.contact, ...(data.contact || {}) },
          footer: { ...defaultSiteContent.footer, ...(data.footer || {}) },
        };
        setContent(merged);
        localStorage.setItem("looksdehoje_site_content_server_supported", "true");
        try {
          localStorage.setItem("looksdehoje_site_content", JSON.stringify(merged));
        } catch {
          // ignore
        }
      } else if (response.status === 404) {
        // Backend hasn't implemented /api/site-content yet
        localStorage.setItem("looksdehoje_site_content_server_supported", "false");
        console.info(
          "Endpoint /api/site-content não encontrado no servidor de produção (404). Utilizando persistência local."
        );
      }
    } catch {
      // Network or offline fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  const updateContent = async (newContent: Partial<SiteContent>): Promise<boolean> => {
    const merged: SiteContent = {
      header: { ...content.header, ...(newContent.header || {}) },
      collection: { ...content.collection, ...(newContent.collection || {}) },
      rules: { ...content.rules, ...(newContent.rules || {}) },
      contact: { ...content.contact, ...(newContent.contact || {}) },
      footer: { ...content.footer, ...(newContent.footer || {}) },
    };

    // Always persist locally first so changes are preserved
    setContent(merged);
    try {
      localStorage.setItem("looksdehoje_site_content", JSON.stringify(merged));
    } catch {
      // ignore
    }

    // Also update rules data in localStorage if rules section was modified
    if (newContent.rules) {
      try {
        const existingRulesRaw = localStorage.getItem("looksdehoje_rules_data");
        const existingData = existingRulesRaw ? JSON.parse(existingRulesRaw) : {};
        const updatedRulesData = {
          ...existingData,
          settings: {
            ...(existingData.settings || {}),
            title: newContent.rules.section_title ?? existingData.settings?.title,
            subtitle: newContent.rules.section_subtitle ?? existingData.settings?.subtitle,
            support_title: newContent.rules.support_title ?? existingData.settings?.support_title,
            support_description: newContent.rules.support_description ?? existingData.settings?.support_description,
          },
          rules: existingData.rules || [],
        };
        localStorage.setItem("looksdehoje_rules_data", JSON.stringify(updatedRulesData));
      } catch {
        // ignore
      }
    }

    const isRemoteProduction = isRemoteProductionHost();
    const cachedSupport = localStorage.getItem("looksdehoje_site_content_server_supported");
    if (!isRemoteProduction && cachedSupport !== "false") {
      try {
        const response = await api.put("/site-content", newContent);
        if (response.data) {
          const serverMerged: SiteContent = {
            header: { ...defaultSiteContent.header, ...(response.data.header || {}) },
            collection: { ...defaultSiteContent.collection, ...(response.data.collection || {}) },
            rules: { ...defaultSiteContent.rules, ...(response.data.rules || {}) },
            contact: { ...defaultSiteContent.contact, ...(response.data.contact || {}) },
            footer: { ...defaultSiteContent.footer, ...(response.data.footer || {}) },
          };
          setContent(serverMerged);
          localStorage.setItem("looksdehoje_site_content_server_supported", "true");
          try {
            localStorage.setItem("looksdehoje_site_content", JSON.stringify(serverMerged));
          } catch {
            // ignore
          }
        }
      } catch (error: any) {
        if (error?.response?.status === 404 || error?.status === 404) {
          localStorage.setItem("looksdehoje_site_content_server_supported", "false");
          console.info(
            "Endpoint /api/site-content não encontrado no servidor de produção (404). Conteúdo salvo localmente com sucesso."
          );
        } else {
          console.warn("Aviso ao sincronizar conteúdo com o servidor:", error?.message);
        }
      }
    }

    return true;
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
