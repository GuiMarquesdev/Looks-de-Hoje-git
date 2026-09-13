// src/contexts/AdminFeedbackContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, Info, Sparkles, ArrowRight } from "lucide-react";

export type FeedbackType = "success" | "error" | "warning" | "info";

export interface FeedbackOptions {
  title: string;
  message: string;
  type?: FeedbackType;
  details?: string | string[];
  actionLabel?: string;
  onAction?: () => void;
  autoCloseMs?: number; // Optional auto-close timer if desired, default none or manual
}

interface AdminFeedbackContextType {
  showFeedback: (options: FeedbackOptions) => void;
  showSuccess: (title: string, message: string, details?: string | string[]) => void;
  showError: (title: string, message: string, details?: string | string[]) => void;
  closeFeedback: () => void;
}

const AdminFeedbackContext = createContext<AdminFeedbackContextType>({
  showFeedback: () => {},
  showSuccess: () => {},
  showError: () => {},
  closeFeedback: () => {},
});

export const AdminFeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackOptions | null>(null);

  const showFeedback = useCallback((options: FeedbackOptions) => {
    setCurrentFeedback(options);
    setIsOpen(true);
  }, []);

  const showSuccess = useCallback((title: string, message: string, details?: string | string[]) => {
    showFeedback({
      type: "success",
      title,
      message,
      details,
    });
  }, [showFeedback]);

  const showError = useCallback((title: string, message: string, details?: string | string[]) => {
    showFeedback({
      type: "error",
      title,
      message,
      details,
    });
  }, [showFeedback]);

  const closeFeedback = useCallback(() => {
    setIsOpen(false);
  }, []);

  const type = currentFeedback?.type || "success";

  return (
    <AdminFeedbackContext.Provider
      value={{
        showFeedback,
        showSuccess,
        showError,
        closeFeedback,
      }}
    >
      {children}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          id="admin-confirmation-popup"
          className="sm:max-w-md border-border/80 shadow-2xl rounded-2xl bg-white p-6 overflow-hidden animate-in fade-in-0 zoom-in-95"
        >
          {/* Top Decorative accent bar based on status */}
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 ${
              type === "success"
                ? "bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600"
                : type === "error"
                ? "bg-gradient-to-r from-rose-500 to-red-600"
                : type === "warning"
                ? "bg-gradient-to-r from-amber-400 to-orange-500"
                : "bg-gradient-to-r from-primary to-amber-500"
            }`}
          />

          <div className="flex flex-col items-center text-center pt-2">
            {/* Icon Bubble */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 ${
                type === "success"
                  ? "bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60"
                  : type === "error"
                  ? "bg-red-50 text-red-600 ring-8 ring-red-50/60"
                  : type === "warning"
                  ? "bg-amber-50 text-amber-600 ring-8 ring-amber-50/60"
                  : "bg-primary/10 text-primary ring-8 ring-primary/5"
              }`}
            >
              {type === "success" && <CheckCircle2 className="w-9 h-9" />}
              {type === "error" && <XCircle className="w-9 h-9" />}
              {type === "warning" && <AlertTriangle className="w-9 h-9" />}
              {type === "info" && <Info className="w-9 h-9" />}
            </div>

            {/* Title */}
            <DialogHeader className="space-y-1.5 text-center sm:text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {type === "success"
                  ? "Status da Operação: Sucesso"
                  : type === "error"
                  ? "Status da Operação: Falha"
                  : "Aviso do Sistema"}
              </div>
              <DialogTitle className="text-xl font-bold font-playfair tracking-tight text-foreground">
                {currentFeedback?.title}
              </DialogTitle>
              <DialogDescription className="text-sm font-montserrat text-zinc-600 max-w-sm mx-auto leading-relaxed pt-1">
                {currentFeedback?.message}
              </DialogDescription>
            </DialogHeader>

            {/* Optional Details (e.g. error list or modified item details) */}
            {currentFeedback?.details && (
              <div className="w-full mt-4 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-left text-xs font-mono text-zinc-700 max-h-36 overflow-y-auto">
                {Array.isArray(currentFeedback.details) ? (
                  <ul className="list-disc list-inside space-y-1">
                    {currentFeedback.details.map((item, idx) => (
                      <li key={idx} className="leading-snug">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="whitespace-pre-line leading-snug">{currentFeedback.details}</p>
                )}
              </div>
            )}

            {/* Action confirmation button */}
            <div className="w-full mt-6 pt-2 flex items-center justify-center gap-3">
              <Button
                id="admin-confirmation-close-btn"
                onClick={() => {
                  if (currentFeedback?.onAction) {
                    currentFeedback.onAction();
                  }
                  closeFeedback();
                }}
                className={`w-full font-semibold font-montserrat h-10 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
                  type === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : type === "error"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {currentFeedback?.actionLabel || "Entendido, prosseguir"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminFeedbackContext.Provider>
  );
};

export const useAdminFeedback = () => useContext(AdminFeedbackContext);
