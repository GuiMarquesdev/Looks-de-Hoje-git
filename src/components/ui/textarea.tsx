import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, maxLength, onChange, ...props }, ref) => {
    // 1. Estado Interno para a contagem (garante que a contagem atualize a cada digitação)
    const [internalValue, setInternalValue] = React.useState(
      value ? String(value) : ""
    );

    // 2. Sincroniza o estado interno com o prop 'value' externo (para uso como componente controlado)
    React.useEffect(() => {
      setInternalValue(value ? String(value) : "");
    }, [value]);

    // 3. Lógica para o contador
    const currentLength = internalValue.length;

    // 4. Converte maxLength para número de forma segura
    const maxLen =
      typeof maxLength === "number"
        ? maxLength
        : typeof maxLength === "string"
        ? Number(maxLength)
        : undefined;

    const isMaxLenValid = maxLen !== undefined && !isNaN(maxLen) && maxLen > 0;

    // 5. Novo handler de mudança que atualiza o estado interno E chama o handler externo
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalValue(e.target.value);
      if (onChange) {
        onChange(e); // Chama o onChange original do componente pai (ex: React Hook Form)
      }
    };

    return (
      // Wrapper com posição relativa para ancorar o contador
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            // Ajusta o padding e remove o redimensionamento vertical se houver contador
            isMaxLenValid ? "pr-12 resize-none" : "resize-y",
            className
          )}
          ref={ref}
          value={internalValue} // Usa o valor do estado interno
          onChange={handleChange} // Usa o handler customizado
          maxLength={maxLength} // Passa o maxLength original (para o limite de input do browser)
          {...props}
        />

        {/* Renderiza o contador condicionalmente */}
        {isMaxLenValid && (
          <div
            className={cn(
              "absolute bottom-2 right-3 text-xs",
              // Destaque em vermelho se atingir/ultrapassar o limite
              currentLength >= maxLen!
                ? "text-red-500"
                : "text-muted-foreground"
            )}
          >
            {currentLength} / {maxLen}
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
