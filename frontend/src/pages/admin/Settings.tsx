// frontend/src/pages/admin/Settings.tsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  Shield,
  Store,
  Link as LinkIcon,
} from "lucide-react";
import { API_URL } from "@/config/api";

// Mapeando a estrutura do banco de dados
interface StoreSettings {
  id: string;
  store_name: string;
  instagram_url?: string;
  whatsapp_url?: string;
  email?: string;
}

// ------------------------------------------
// Funções Utilitárias para API (SIMPLIFICADAS)
// ------------------------------------------
const directApiRequest = async (
  path: string,
  method: "GET" | "PUT",
  body?: any
) => {
  const headers = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(`${API_URL}${path}`, config);

  if (!response.ok) {
    let errorDetail = "Erro na requisição";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.message || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return null;
  }

  return response.json();
};

const Settings = () => {
  // useAdmin REMOVIDO

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    store_name: "",
    instagram_url: "",
    whatsapp_url: "",
    email: "",
    // Campos de senha REMOVIDOS
  });

  useEffect(() => {
    fetchSettings();
  }, []); // Dependência [token] REMOVIDA

  // ------------------------------------------
  // LÓGICA DE BUSCA DE DADOS (GET)
  // ------------------------------------------
  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Chamada direta, sem token
      const data = await directApiRequest("/admin/settings", "GET");

      if (!data) {
        throw new Error("Dados de configurações não encontrados.");
      }

      setSettings(data);
      setFormData({
        store_name: data.store_name || "",
        instagram_url: data.instagram_url || "",
        whatsapp_url: data.whatsapp_url || "",
        email: data.email || "",
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error(
        `Erro ao carregar configurações: ${(error as Error).message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ------------------------------------------
  // LÓGICA DE ATUALIZAÇÃO DE INFO DA LOJA (PUT)
  // ------------------------------------------
  const saveStoreInfo = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const updatePayload = {
        store_name: formData.store_name,
        instagram_url: formData.instagram_url,
        whatsapp_url: formData.whatsapp_url,
        email: formData.email,
      };

      // Chamada PUT sem token
      await directApiRequest("/admin/settings", "PUT", updatePayload);

      toast.success("Informações da loja atualizadas com sucesso!");
      fetchSettings();
    } catch (error) {
      console.error("Error updating store info:", error);
      toast.error(
        `Erro ao atualizar informações da loja: ${(error as Error).message}`
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------
  // LÓGICA DE ALTERAÇÃO DE SENHA (SIMPLIFICADA/INATIVA)
  // A função `changePassword` não será mais chamada, mas foi mantida no escopo.
  // ------------------------------------------
  const changePassword = async () => {
    toast.info(
      "A alteração de senha foi desabilitada, pois o login foi removido."
    );
  };

  if (loading) {
    // ... (Estado de carregamento)
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid gap-6">
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Configurações
        </h1>
        <p className="text-muted-foreground font-montserrat">
          Gerencie as configurações da loja (Acesso Direto)
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Store Information (Mantido) */}
        <Card className="luxury-card">
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Informações da Loja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ... Campos de formulário ... */}
            <div className="space-y-2">
              <Label htmlFor="store_name" className="font-montserrat">
                Nome da Loja
              </Label>
              <Input
                id="store_name"
                value={formData.store_name}
                onChange={(e) =>
                  handleInputChange("store_name", e.target.value)
                }
                placeholder="LooksdeHoje"
                className="font-montserrat"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-montserrat">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="contato@looksdehoje.com"
                className="font-montserrat"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold font-montserrat flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Links Sociais
              </h3>

              <div className="space-y-2">
                <Label htmlFor="instagram_url" className="font-montserrat">
                  Instagram
                </Label>
                <Input
                  id="instagram_url"
                  value={formData.instagram_url}
                  onChange={(e) =>
                    handleInputChange("instagram_url", e.target.value)
                  }
                  placeholder="https://instagram.com/looksdehoje"
                  className="font-montserrat"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_url" className="font-montserrat">
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp_url"
                  value={formData.whatsapp_url}
                  onChange={(e) =>
                    handleInputChange("whatsapp_url", e.target.value)
                  }
                  placeholder="https://wa.me/5511999999999"
                  className="font-montserrat"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={saveStoreInfo}
                disabled={saving}
                className="bg-primary hover:bg-primary-dark font-montserrat"
              >
                {saving ? "Salvando..." : "Salvar Informações"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
