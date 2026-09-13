import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Save,
  Loader2,
  Check,
  Eye,
  Sliders,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminFeedback } from "@/contexts/AdminFeedbackContext";
import { useSiteContent } from "@/contexts/SiteContentContext";
import api from "../../config/api";
import {
  RuleItem as RuleCardItem,
  RulesSettings,
  defaultRules,
  defaultRulesSettings,
} from "@/data/defaultRules";

export type { RuleCardItem, RulesSettings };

// Available icons mapping
const AVAILABLE_ICONS = [
  { name: "Clock", label: "Relógio / Tempo", component: Clock },
  { name: "Truck", label: "Entrega / Frete", component: Truck },
  { name: "Shield", label: "Proteção / Segurança", component: Shield },
  { name: "CreditCard", label: "Pagamento / Cartão", component: CreditCard },
  { name: "CheckCircle", label: "Verificação / Condições", component: CheckCircle },
  { name: "AlertCircle", label: "Aviso / Danos", component: AlertCircle },
  { name: "Sparkles", label: "Destaque / Qualidade", component: Sparkles },
  { name: "Heart", label: "Cuidado / Carinho", component: Heart },
  { name: "Calendar", label: "Datas / Prazos", component: Calendar },
  { name: "Star", label: "Exclusividade / Premium", component: Star },
  { name: "Award", label: "Garantia / Selo", component: Award },
  { name: "ShoppingBag", label: "Peças / Sacola", component: ShoppingBag },
  { name: "Tag", label: "Preço / Desconto", component: Tag },
  { name: "FileText", label: "Contrato / Termos", component: FileText },
  { name: "Info", label: "Informação", component: Info },
  { name: "HelpCircle", label: "Ajuda / Dúvidas", component: HelpCircle },
];

const getIconComponent = (iconName: string) => {
  const match = AVAILABLE_ICONS.find(
    (i) => i.name.toLowerCase() === (iconName || "").toLowerCase()
  );
  return match ? match.component : Shield;
};

const RulesManagement = () => {
  const { showSuccess, showError } = useAdminFeedback();
  const { updateContent } = useSiteContent();
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingRule, setSavingRule] = useState(false);

  const [serverSupported, setServerSupported] = useState<boolean>(() => {
    if (API_URL.includes("lookdehoje.com")) {
      return false;
    }
    try {
      const cached = localStorage.getItem("looksdehoje_rules_server_supported");
      if (cached !== null) return cached === "true";
    } catch {
      // ignore
    }
    return true;
  });

  const [rules, setRules] = useState<RuleCardItem[]>(() => {
    try {
      const cached = localStorage.getItem("looksdehoje_rules_data");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.rules)) return parsed.rules;
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
        if (parsed.settings) return { ...defaultRulesSettings, ...parsed.settings };
      }
    } catch {
      // ignore
    }
    return defaultRulesSettings;
  });

  // Helper to persist in localStorage
  const saveLocalRulesData = (updatedSettings: RulesSettings, updatedRules: RuleCardItem[]) => {
    try {
      localStorage.setItem(
        "looksdehoje_rules_data",
        JSON.stringify({ settings: updatedSettings, rules: updatedRules })
      );
    } catch (err) {
      console.warn("Não foi possível salvar no localStorage:", err);
    }
  };

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleCardItem | null>(null);

  // AlertDialog states
  const [ruleToDelete, setRuleToDelete] = useState<RuleCardItem | null>(null);
  const [isDeletingRule, setIsDeletingRule] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Form states for rule editing
  const [formData, setFormData] = useState<{
    icon: string;
    title: string;
    description: string;
    detailsText: string;
    order: number;
    is_active: boolean;
  }>({
    icon: "Shield",
    title: "",
    description: "",
    detailsText: "",
    order: 1,
    is_active: true,
  });

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const cached = localStorage.getItem("looksdehoje_rules_data");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.settings) setSettings({ ...defaultRulesSettings, ...parsed.settings });
          if (Array.isArray(parsed.rules)) setRules(parsed.rules);
        } catch {
          // ignore
        }
      }

      const isRemoteProduction = API_URL.includes("lookdehoje.com");
      const cachedSupport = localStorage.getItem("looksdehoje_rules_server_supported");
      if (isRemoteProduction || cachedSupport === "false") {
        setServerSupported(false);
        setLoading(false);
        return;
      }

      const response = await api.get<{ settings: RulesSettings; rules: RuleCardItem[] }>("/rules");
      if (response.data) {
        if (response.data.settings) {
          setSettings({ ...defaultRulesSettings, ...response.data.settings });
        }
        if (response.data.rules && Array.isArray(response.data.rules)) {
          setRules(response.data.rules);
        }
        saveLocalRulesData(response.data.settings || settings, response.data.rules || rules);
        setServerSupported(true);
        localStorage.setItem("looksdehoje_rules_server_supported", "true");
      }
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.status === 404) {
        setServerSupported(false);
        localStorage.setItem("looksdehoje_rules_server_supported", "false");
        console.info(
          "Endpoint /api/rules não encontrado no servidor de produção (404). Modo local ativo."
        );
        const cached = localStorage.getItem("looksdehoje_rules_data");
        if (!cached) {
          saveLocalRulesData(defaultRulesSettings, defaultRules);
        }
      } else {
        console.warn("Aviso ao carregar regras:", error?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save general settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      // 1. Save local state & persistence
      saveLocalRulesData(settings, rules);

      // 2. Synchronize with site content context so all pages receive the new titles immediately
      updateContent({
        rules: {
          section_title: settings.title,
          section_subtitle: settings.subtitle,
          support_title: settings.support_title,
          support_description: settings.support_description,
        },
      });

      // 3. Attempt server sync only if supported
      if (serverSupported) {
        try {
          await api.put("/rules/settings", settings);
          localStorage.setItem("looksdehoje_rules_server_supported", "true");
        } catch (err: any) {
          if (err?.response?.status === 404 || err?.status === 404) {
            setServerSupported(false);
            localStorage.setItem("looksdehoje_rules_server_supported", "false");
            console.info("Endpoint /api/rules/settings não encontrado no servidor remoto (404). Salvo localmente.");
          }
        }
      }

      toast.success("Cabeçalho e textos da seção salvos com sucesso!");
      showSuccess(
        "Textos das Regras Salvos!",
        "O cabeçalho, subtítulo e mensagem de suporte das Regras de Aluguel foram gravados e já estão atualizados no site.",
        [
          `Título da Seção: "${settings.title}"`,
          `Card de Suporte: "${settings.support_title}"`,
        ]
      );
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar os textos da seção.");
      showError("Falha ao Salvar Textos", "Não foi possível atualizar os textos das regras.", error?.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Open modal to add rule
  const handleOpenNewRule = () => {
    setEditingRule(null);
    setFormData({
      icon: "Shield",
      title: "",
      description: "",
      detailsText: "",
      order: rules.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  // Open modal to edit rule
  const handleOpenEditRule = (rule: RuleCardItem) => {
    setEditingRule(rule);
    setFormData({
      icon: rule.icon || "Shield",
      title: rule.title,
      description: rule.description,
      detailsText: (rule.details || []).join("\n"),
      order: rule.order || 1,
      is_active: rule.is_active !== false,
    });
    setIsModalOpen(true);
  };

  // Save rule (Create or Update)
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Por favor, preencha o título do card.");
      return;
    }

    const detailsArray = formData.detailsText
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const payload = {
      icon: formData.icon,
      title: formData.title.trim(),
      description: formData.description.trim(),
      details: detailsArray,
      order: Number(formData.order) || 1,
      is_active: formData.is_active,
    };

    try {
      setSavingRule(true);
      if (editingRule) {
        // Edit existing
        let updatedRule: RuleCardItem = {
          ...editingRule,
          ...payload,
        };
        if (serverSupported) {
          try {
            const response = await api.put<RuleCardItem>(`/rules/${editingRule.id}`, payload);
            if (response.data) updatedRule = response.data;
          } catch (err: any) {
            if (err?.response?.status === 404 || err?.status === 404) {
              setServerSupported(false);
              localStorage.setItem("looksdehoje_rules_server_supported", "false");
            }
          }
        }
        const newRules = rules.map((item) => (item.id === editingRule.id ? updatedRule : item));
        setRules(newRules);
        saveLocalRulesData(settings, newRules);

        toast.success("Card de regra atualizado com sucesso!");
        showSuccess(
          "Regra Atualizada com Sucesso!",
          `As regras e detalhes do card "${payload.title}" foram salvos com sucesso.`,
          [`Ícone: ${payload.icon}`, `Itens de detalhe: ${detailsArray.length}`]
        );
      } else {
        // Create new
        let newRule: RuleCardItem = {
          id: String(Date.now()),
          ...payload,
        };
        if (serverSupported) {
          try {
            const response = await api.post<RuleCardItem>("/rules", payload);
            if (response.data) newRule = response.data;
          } catch (err: any) {
            if (err?.response?.status === 404 || err?.status === 404) {
              setServerSupported(false);
              localStorage.setItem("looksdehoje_rules_server_supported", "false");
            }
          }
        }
        const newRules = [...rules, newRule].sort((a, b) => (a.order || 0) - (b.order || 0));
        setRules(newRules);
        saveLocalRulesData(settings, newRules);

        toast.success("Novo card de regra adicionado!");
        showSuccess(
          "Nova Regra Cadastrada!",
          `O card de regra "${payload.title}" foi criado com sucesso e publicado na seção de regras.`,
          [`Ícone: ${payload.icon}`, `Ordem: #${payload.order}`]
        );
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Erro ao salvar regra:", error);
      toast.error("Erro ao salvar o card de regra.");
      showError("Falha ao Salvar Regra", "Não foi possível salvar as alterações da regra.", error?.message);
    } finally {
      setSavingRule(false);
    }
  };

  // Quick toggle active status
  const handleToggleActive = async (rule: RuleCardItem) => {
    const updatedStatus = !rule.is_active;
    const newRules = rules.map((r) => (r.id === rule.id ? { ...r, is_active: updatedStatus } : r));
    setRules(newRules);
    saveLocalRulesData(settings, newRules);
    toast.success(
      `Card "${rule.title}" ${updatedStatus ? "ativado" : "desativado"} com sucesso.`
    );
    if (serverSupported) {
      try {
        await api.put(`/rules/${rule.id}`, { is_active: updatedStatus });
      } catch (error: any) {
        if (error?.response?.status === 404 || error?.status === 404) {
          setServerSupported(false);
          localStorage.setItem("looksdehoje_rules_server_supported", "false");
        } else {
          console.warn("Aviso ao atualizar status no servidor:", error?.message);
        }
      }
    }
  };

  // Delete rule confirmation
  const handleConfirmDeleteRule = async () => {
    if (!ruleToDelete) return;

    setIsDeletingRule(true);
    try {
      const newRules = rules.filter((r) => r.id !== ruleToDelete.id);
      setRules(newRules);
      saveLocalRulesData(settings, newRules);

      if (serverSupported) {
        try {
          await api.delete(`/rules/${ruleToDelete.id}`);
        } catch (err: any) {
          if (err?.response?.status === 404 || err?.status === 404) {
            setServerSupported(false);
            localStorage.setItem("looksdehoje_rules_server_supported", "false");
          }
        }
      }

      toast.success(`Card "${ruleToDelete.title}" excluído com sucesso.`);
      showSuccess(
        "Regra Removida com Sucesso!",
        `O card de regra "${ruleToDelete.title}" foi removido com sucesso.`
      );
      setRuleToDelete(null);
    } catch (error: any) {
      console.error("Erro ao excluir regra:", error);
      toast.error("Erro ao excluir o card.");
      showError("Erro ao Excluir Regra", "Não foi possível remover o card de regra.", error?.message);
    } finally {
      setIsDeletingRule(false);
    }
  };

  // Move order up or down
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const newRules = [...rules];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newRules.length) return;

    const currentItem = newRules[index];
    const targetItem = newRules[targetIndex];

    const tempOrder = currentItem.order;
    currentItem.order = targetItem.order;
    targetItem.order = tempOrder;

    newRules[index] = targetItem;
    newRules[targetIndex] = currentItem;

    const sortedRules = [...newRules].sort((a, b) => (a.order || 0) - (b.order || 0));
    setRules(sortedRules);
    saveLocalRulesData(settings, sortedRules);
    toast.success("Ordem atualizada com sucesso!");

    if (serverSupported) {
      try {
        await Promise.all([
          api.put(`/rules/${currentItem.id}`, { order: currentItem.order }),
          api.put(`/rules/${targetItem.id}`, { order: targetItem.order }),
        ]);
      } catch (error: any) {
        if (error?.response?.status === 404 || error?.status === 404) {
          setServerSupported(false);
          localStorage.setItem("looksdehoje_rules_server_supported", "false");
        }
      }
    }
  };

  // Reset to default rules confirmation
  const handleConfirmResetDefaults = async () => {
    setIsResetting(true);
    try {
      setSettings(defaultRulesSettings);
      setRules(defaultRules);
      saveLocalRulesData(defaultRulesSettings, defaultRules);

      if (serverSupported) {
        try {
          await api.post("/rules/reset");
        } catch (err: any) {
          if (err?.response?.status === 404 || err?.status === 404) {
            setServerSupported(false);
            localStorage.setItem("looksdehoje_rules_server_supported", "false");
          }
        }
      }

      setShowResetDialog(false);
      toast.success("Regras restauradas para os valores padrão!");
    } catch (error) {
      console.error("Erro ao restaurar padrões:", error);
      toast.error("Erro ao restaurar padrões.");
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="font-montserrat text-sm">Carregando painel de regras...</p>
      </div>
    );
  }

  const PreviewIcon = getIconComponent(formData.icon);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold font-playfair text-foreground tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Gestão das Regras de Aluguel
          </h1>
          <p className="text-muted-foreground text-sm font-montserrat mt-1">
            Gerencie os cards exibidos na seção de Regras da página inicial da loja.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowResetDialog(true)}
            className="flex items-center gap-2 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            title="Restaurar cards e textos para a configuração padrão"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar Padrões
          </Button>

          <Button
            onClick={handleOpenNewRule}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Card de Regra
          </Button>
        </div>
      </div>

      {/* Compatibility Notice when Production Server /api/rules is 404 */}
      {!serverSupported && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-sm">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Modo de Persistência Local Ativo</p>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
              O servidor em produção retornou status 404 para a rota <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[11px]">/api/rules</code>. Todas as suas alterações (edições, novos cards, reordenação e cabeçalho) estão sendo salvas localmente e permanecem visíveis na página inicial da loja.
            </p>
          </div>
        </div>
      )}

      {/* Section Settings Header Card */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-playfair flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            Textos e Cabeçalho da Seção
          </CardTitle>
          <CardDescription className="text-xs font-montserrat">
            Edite o título principal, subtítulo e os textos do card de suporte da seção.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Título da Seção
                </label>
                <Input
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  placeholder="Ex: Regras de Aluguel"
                  className="font-playfair font-semibold text-base"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Subtítulo Explicativo
                </label>
                <Input
                  value={settings.subtitle}
                  onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                  placeholder="Ex: Conheça nossas políticas para garantir..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Título da Caixa de Dúvidas
                </label>
                <Input
                  value={settings.support_title}
                  onChange={(e) => setSettings({ ...settings, support_title: e.target.value })}
                  placeholder="Dúvidas sobre nossas regras?"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Descrição do Atendimento
                </label>
                <Input
                  value={settings.support_description}
                  onChange={(e) =>
                    setSettings({ ...settings, support_description: e.target.value })
                  }
                  placeholder="Nossa equipe está sempre disponível..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={savingSettings}
                className="flex items-center gap-2"
              >
                {savingSettings ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Textos da Seção
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Cards List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-playfair font-bold text-foreground flex items-center gap-2">
              Cards Atuais ({rules.length})
            </h2>
            <p className="text-xs text-muted-foreground font-montserrat">
              Cada card abaixo corresponde a um item no grid de regras do site. Você pode editar o texto, ícone, itens da lista ou desativar temporariamente.
            </p>
          </div>
        </div>

        {rules.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-card">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-40" />
            <h3 className="font-playfair text-lg font-semibold text-foreground">Nenhum card cadastrado</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
              Clique em "Novo Card de Regra" para criar um ou em "Restaurar Padrões" para carregar os modelos iniciais.
            </p>
            <div className="mt-4">
              <Button onClick={handleOpenNewRule} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Primeiro Card
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rules.map((rule, index) => {
              const IconComp = getIconComponent(rule.icon);
              return (
                <div
                  key={rule.id}
                  className={`relative flex flex-col justify-between rounded-xl border p-6 bg-card transition-all duration-200 shadow-sm hover:shadow-md ${
                    rule.is_active ? "border-border" : "border-border/60 bg-muted/20 opacity-75"
                  }`}
                >
                  {/* Top Bar: Icon, Active Switch, Order Controls */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-secondary/40 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div>
                          <Badge variant="outline" className="text-[11px] font-mono">
                            Ordem #{rule.order}
                          </Badge>
                          {!rule.is_active && (
                            <Badge variant="secondary" className="ml-2 text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                              Oculto no site
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Order Controls */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(index, "up")}
                          title="Mover para cima"
                        >
                          <MoveUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          disabled={index === rules.length - 1}
                          onClick={() => handleMoveOrder(index, "down")}
                          title="Mover para baixo"
                        >
                          <MoveDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Card Title */}
                    <h3 className="font-playfair text-lg font-bold text-foreground mb-2 line-clamp-1">
                      {rule.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm font-montserrat leading-relaxed mb-4 line-clamp-3">
                      {rule.description}
                    </p>

                    {/* Details Bullet List */}
                    {rule.details && rule.details.length > 0 && (
                      <div className="space-y-1.5 mb-6 pt-3 border-t border-border/60">
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                          Pontos detalhados:
                        </p>
                        <ul className="space-y-1 text-xs text-foreground/80 font-montserrat">
                          {rule.details.map((detail, dIdx) => (
                            <li key={dIdx} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              <span className="line-clamp-2">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Controls */}
                  <div className="pt-4 border-t border-border flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`active-${rule.id}`}
                        checked={rule.is_active}
                        onCheckedChange={() => handleToggleActive(rule)}
                      />
                      <label
                        htmlFor={`active-${rule.id}`}
                        className="text-xs text-muted-foreground cursor-pointer select-none"
                      >
                        {rule.is_active ? "Ativo" : "Inativo"}
                      </label>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditRule(rule)}
                        className="h-8 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRuleToDelete(rule)}
                        className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit / Create Rule Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl flex items-center gap-2">
              {editingRule ? (
                <>
                  <Edit2 className="w-5 h-5 text-primary" />
                  Editar Card: {editingRule.title}
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-primary" />
                  Novo Card de Regra de Aluguel
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs font-montserrat">
              Preencha os campos abaixo para personalizar este card de regra exibido na loja.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRule} className="space-y-5 py-2">
            {/* Icon Picker Section */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Ícone do Card</span>
                <span className="text-foreground font-medium flex items-center gap-1.5 text-xs normal-case">
                  Selecionado: <PreviewIcon className="w-4 h-4 text-primary" /> {formData.icon}
                </span>
              </label>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                {AVAILABLE_ICONS.map((item) => {
                  const IconC = item.component;
                  const isSelected = formData.icon.toLowerCase() === item.name.toLowerCase();
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: item.name })}
                      title={item.label}
                      className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs scale-105"
                          : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <IconC className="w-5 h-5" />
                      <span className="text-[10px] mt-1 truncate max-w-full font-mono">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Order & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Título do Card *
                </label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Período de Locação"
                  className="font-playfair text-base font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Posição / Ordem
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) || 1 })}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Descrição Resumida
              </label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Peças podem ser alugadas por 1 a 7 dias, com possibilidade de extensão..."
                className="font-montserrat text-sm resize-none"
              />
            </div>

            {/* Details (Bullets) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Itens Detalhados (1 por linha)
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Cada linha virará um marcador com ponto dourado no card
                </span>
              </div>
              <Textarea
                rows={4}
                value={formData.detailsText}
                onChange={(e) => setFormData({ ...formData, detailsText: e.target.value })}
                placeholder={"Locação mínima: 5 dias corridos\nLocação máxima: 20 dias corridos\nProrrogação mediante solicitação prévia"}
                className="font-montserrat text-sm"
              />
            </div>

            {/* Active Toggle & Preview */}
            <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-lg border border-border">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-foreground">Exibir este card no site</div>
                <div className="text-xs text-muted-foreground">
                  Se desmarcado, a regra fica guardada no painel mas oculta para os clientes.
                </div>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={savingRule}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={savingRule} className="gap-2">
                {savingRule ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingRule ? "Salvar Alterações" : "Criar Card"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão de Regra */}
      <AlertDialog
        open={Boolean(ruleToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeletingRule) {
            setRuleToDelete(null);
          }
        }}
      >
        <AlertDialogContent className="font-montserrat">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-playfair text-xl text-foreground">
              Excluir Card de Regra
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              Tem certeza que deseja excluir o card{" "}
              <strong className="text-foreground font-semibold">
                "{ruleToDelete?.title}"
              </strong>
              ? Esta regra deixará de ser exibida na página inicial da loja.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingRule}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteRule}
              disabled={isDeletingRule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingRule ? "Excluindo..." : "Sim, Excluir Card"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação de Restauração de Padrões */}
      <AlertDialog
        open={showResetDialog}
        onOpenChange={(open) => {
          if (!open && !isResetting) {
            setShowResetDialog(false);
          }
        }}
      >
        <AlertDialogContent className="font-montserrat">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-playfair text-xl text-foreground">
              Restaurar Padrões de Fábrica
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              Deseja restaurar todos os 6 cards e textos informativos originais de aluguel para o padrão de fábrica?
              As personalizações atuais serão substituídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmResetDefaults}
              disabled={isResetting}
              className="bg-primary text-primary-foreground hover:bg-primary-dark"
            >
              {isResetting ? "Restaurando..." : "Confirmar Restauração"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RulesManagement;
