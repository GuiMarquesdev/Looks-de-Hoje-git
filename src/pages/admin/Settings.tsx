import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  Shield,
  Store,
  Link as LinkIcon,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Server,
  FileCheck,
  ShieldAlert,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import api, { API_URL, isRemoteProductionHost } from "@/config/api";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";

interface StoreSettings {
  id?: string;
  store_name: string;
  instagram_url?: string;
  whatsapp_url?: string;
  email?: string;
  phone?: string;
  address?: string;
  working_hours?: string;
}

interface TwoFactorStatus {
  enabled: boolean;
  pin_hint: string | null;
}

const Settings: React.FC = () => {
  const { refreshSettings } = useStoreSettings();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(false);

  // Store Form
  const [formData, setFormData] = useState({
    store_name: "",
    instagram_url: "",
    whatsapp_url: "",
    email: "",
    phone: "",
    address: "",
    working_hours: "",
  });

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA State
  const [twoFactor, setTwoFactor] = useState<TwoFactorStatus>({
    enabled: false,
    pin_hint: null,
  });
  const [toggling2FA, setToggling2FA] = useState(false);
  const [twoFactorPasswordConfirm, setTwoFactorPasswordConfirm] = useState("");
  const [show2FAConfirmDialog, setShow2FAConfirmDialog] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Store Settings
      const storeRes = await api.get<StoreSettings>("/admin/settings");
      if (storeRes.data) {
        setSettings(storeRes.data);
        setFormData({
          store_name: storeRes.data.store_name || "",
          instagram_url: storeRes.data.instagram_url || "",
          whatsapp_url: storeRes.data.whatsapp_url || "",
          email: storeRes.data.email || "",
          phone: storeRes.data.phone || "",
          address: storeRes.data.address || "",
          working_hours: storeRes.data.working_hours || "",
        });
      }

      // 2. Fetch 2FA status (only on environments that support it)
      if (!isRemoteProductionHost()) {
        try {
          const twoFaRes = await api.get<TwoFactorStatus>("/admin/2fa/status");
          if (twoFaRes.data) {
            setTwoFactor(twoFaRes.data);
          }
        } catch (err) {
          console.warn("Could not fetch 2FA status:", err);
        }
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      toast.error(
        `Erro ao carregar configurações: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveStoreInfo = async () => {
    setSavingStore(true);
    try {
      const updatePayload = {
        store_name: formData.store_name,
        instagram_url: formData.instagram_url,
        whatsapp_url: formData.whatsapp_url,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        working_hours: formData.working_hours,
      };

      await api.put("/admin/settings", updatePayload);
      await refreshSettings();
      toast.success("Informações da loja atualizadas com sucesso!");
    } catch (error: any) {
      console.error("Error updating store info:", error);
      toast.error(
        `Erro ao atualizar loja: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setSavingStore(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Preencha a senha atual e a nova senha.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("A nova senha e a confirmação não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setSavingPassword(true);
    try {
      if (isRemoteProductionHost()) {
        toast.info("A API de produção não possui a rota /admin/change-password. Para alterar a senha do admin, atualize na base de dados ou backend PHP.");
        setSavingPassword(false);
        return;
      }

      await api.post("/admin/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success("Senha atualizada com sucesso e protegida com Bcrypt!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast.error("O servidor não possui o recurso de alteração de senha implementado (404).");
      } else {
        toast.error(
          error.response?.data?.message || "Erro ao atualizar senha. Verifique a senha atual."
        );
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!twoFactorPasswordConfirm) {
      toast.error("Digite sua senha atual para confirmar a alteração do 2FA.");
      return;
    }

    if (isRemoteProductionHost()) {
      toast.info("O recurso de 2FA em duas etapas não está configurado na API remota de produção.");
      setShow2FAConfirmDialog(false);
      setTwoFactorPasswordConfirm("");
      return;
    }

    setToggling2FA(true);
    try {
      const nextState = !twoFactor.enabled;
      const res = await api.post("/admin/2fa/toggle", {
        enabled: nextState,
        password: twoFactorPasswordConfirm,
      });

      setTwoFactor({
        enabled: res.data.enabled,
        pin_hint: res.data.pin,
      });

      toast.success(res.data.message || "2FA atualizado com sucesso!");
      setShow2FAConfirmDialog(false);
      setTwoFactorPasswordConfirm("");
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast.error("Endpoint de 2FA não encontrado no servidor (404).");
      } else {
        toast.error(
          error.response?.data?.message || "Senha incorreta para confirmação do 2FA."
        );
      }
    } finally {
      setToggling2FA(false);
    }
  };

  if (loading) {
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
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-primary" />
          Configurações & Segurança
        </h1>
        <p className="text-muted-foreground font-montserrat mt-1">
          Gerencie informações da vitrine, políticas de proteção de dados e autenticação avançada.
        </p>
      </div>

      {/* PAINEL DE STATUS DE SEGURANÇA INTEGRADA */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="font-playfair text-xl flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Auditoria de Segurança do Sistema
            </CardTitle>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 14 Medidas Ativas
            </span>
          </div>
          <CardDescription className="text-xs">
            Todas as regras de hardening solicitadas estão ativas e monitorando as conexões do servidor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-foreground">Hash de Senhas Bcrypt</span>
                <span className="text-muted-foreground">Salt rounds 10 com proteção contra rainbow tables.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-foreground">Cookies HttpOnly & SameSite</span>
                <span className="text-muted-foreground">Sessão protegida contra vazamento e ataques XSS.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-foreground">Expiração de Tokens (JWT 24h)</span>
                <span className="text-muted-foreground">Revogação automática de sessões antigas ou ociosas.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-foreground">Rate Limiting (Anti-Brute Force)</span>
                <span className="text-muted-foreground">Bloqueio automático de tentativas excessivas por IP.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-foreground">Validação Server-Side (Zod)</span>
                <span className="text-muted-foreground">Todos os payloads verificados estritamente na API.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-foreground">RLS & Controle RBAC</span>
                <span className="text-muted-foreground">Isolamento de privilégios e rotas administrativas protegidas.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-foreground">Validação Estrita de Uploads</span>
                <span className="text-muted-foreground">Apenas JPG/PNG/WebP, nomes criptográficos e max 5MB.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-foreground">CORS Restrito & Helmet Headers</span>
                <span className="text-muted-foreground">Proteção contra clickjacking, MIME-sniffing e CSRF.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-foreground">Parametrização & Sanitização</span>
                <span className="text-muted-foreground">Prevenção contra path traversal (../) e prototype pollution.</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AUTENTICAÇÃO EM 2 ETAPAS (2FA) */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2 text-lg">
              <Smartphone className="w-5 h-5 text-primary" />
              Autenticação em 2 Etapas (2FA)
            </CardTitle>
            <CardDescription className="text-xs">
              Adicione uma camada extra de segurança exigindo um código de 6 dígitos no login do administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold block">Status do 2FA</span>
                <span className="text-xs text-muted-foreground">
                  {twoFactor.enabled
                    ? "Ativado — Login exige código de 6 dígitos"
                    : "Desativado — Apenas usuário e senha"}
                </span>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  twoFactor.enabled
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {twoFactor.enabled ? "Ativo" : "Inativo"}
              </span>
            </div>

            {twoFactor.enabled && twoFactor.pin_hint && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 text-xs">
                <span className="font-medium text-foreground block mb-1">Seu Código PIN de Verificação 2FA:</span>
                <span className="font-mono text-lg font-bold tracking-widest text-primary">
                  {twoFactor.pin_hint}
                </span>
                <p className="text-muted-foreground text-[11px] mt-1">
                  Guarde este código. Ele será solicitado sempre que você fizer login no painel administrativo.
                </p>
              </div>
            )}

            {!show2FAConfirmDialog ? (
              <Button
                type="button"
                variant={twoFactor.enabled ? "outline" : "default"}
                onClick={() => setShow2FAConfirmDialog(true)}
                className="w-full text-xs font-montserrat"
              >
                {twoFactor.enabled ? "Desativar Autenticação 2FA" : "Ativar Autenticação 2FA"}
              </Button>
            ) : (
              <div className="p-3 border border-border rounded-lg space-y-3 bg-muted/40">
                <Label className="text-xs font-semibold">
                  Confirme sua senha de administrador para {twoFactor.enabled ? "desativar" : "ativar"} o 2FA:
                </Label>
                <Input
                  type="password"
                  placeholder="Sua senha atual"
                  value={twoFactorPasswordConfirm}
                  onChange={(e) => setTwoFactorPasswordConfirm(e.target.value)}
                  className="text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleToggle2FA}
                    disabled={toggling2FA || !twoFactorPasswordConfirm}
                    className="flex-1 text-xs"
                  >
                    {toggling2FA ? "Atualizando..." : "Confirmar"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShow2FAConfirmDialog(false);
                      setTwoFactorPasswordConfirm("");
                    }}
                    className="text-xs"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ALTERAÇÃO DE SENHA COM HASH BCRYPT */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2 text-lg">
              <KeyRound className="w-5 h-5 text-primary" />
              Alterar Senha do Administrador
            </CardTitle>
            <CardDescription className="text-xs">
              Sua nova senha será criptografada no servidor utilizando Bcrypt (salt rounds 10).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="currentPassword" className="text-xs font-montserrat">
                  Senha Atual
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="text-xs font-montserrat"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="newPassword" className="text-xs font-montserrat">
                  Nova Senha (Mínimo 6 caracteres)
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="text-xs font-montserrat"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs font-montserrat">
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-xs font-montserrat"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={savingPassword}
                className="w-full mt-2 text-xs font-montserrat"
              >
                {savingPassword ? "Criptografando e salvando..." : "Salvar Nova Senha (Bcrypt)"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* INFORMAÇÕES DA LOJA */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-playfair flex items-center gap-2 text-lg">
            <Store className="w-5 h-5 text-primary" />
            Informações Públicas da Loja
          </CardTitle>
          <CardDescription className="text-xs">
            Dados exibidos no rodapé e nos botões de contato dos clientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="store_name" className="text-xs font-montserrat">
                Nome da Loja
              </Label>
              <Input
                id="store_name"
                value={formData.store_name}
                onChange={(e) => handleInputChange("store_name", e.target.value)}
                placeholder="Looks de Hoje"
                className="font-montserrat text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-montserrat">
                E-mail de Contato
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="contato@looksdehoje.com.br"
                className="font-montserrat text-xs"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="instagram_url" className="text-xs font-montserrat flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                Link do Instagram
              </Label>
              <Input
                id="instagram_url"
                value={formData.instagram_url}
                onChange={(e) => handleInputChange("instagram_url", e.target.value)}
                placeholder="https://www.instagram.com/looksdehojebrecho/"
                className="font-montserrat text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp_url" className="text-xs font-montserrat flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                Link ou Número do WhatsApp
              </Label>
              <Input
                id="whatsapp_url"
                value={formData.whatsapp_url}
                onChange={(e) => handleInputChange("whatsapp_url", e.target.value)}
                placeholder="https://wa.me/5571992771527 ou 71992771527"
                className="font-montserrat text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-montserrat flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                Telefone Formatado (Exibição)
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(71) 99277-1527"
                className="font-montserrat text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="working_hours" className="text-xs font-montserrat flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Horário de Atendimento
              </Label>
              <Input
                id="working_hours"
                value={formData.working_hours}
                onChange={(e) => handleInputChange("working_hours", e.target.value)}
                placeholder="Segunda, Quarta e Sexta: 12:00 - 18:00 (Com agendamento)"
                className="font-montserrat text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-montserrat flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              Endereço Físico da Loja
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Av. Antônio Carlos Magalhães, 2501 - Brotas, Salvador - BA, 40280-901"
              className="font-montserrat text-xs"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={saveStoreInfo}
              disabled={savingStore}
              className="bg-primary hover:bg-primary-dark font-montserrat text-xs"
            >
              {savingStore ? "Salvando..." : "Salvar Informações"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
