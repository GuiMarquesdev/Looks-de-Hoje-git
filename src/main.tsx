// Caminho: frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// CAMINHO CORRIGIDO: de "./context/AuthContext.tsx" para "./contexts/AuthContext.tsx"
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { StoreSettingsProvider } from "./contexts/StoreSettingsContext.tsx";
import { SiteContentProvider } from "./contexts/SiteContentContext.tsx";
import { AdminFeedbackProvider } from "./contexts/AdminFeedbackContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <StoreSettingsProvider>
        <SiteContentProvider>
          <AdminFeedbackProvider>
            <App />
          </AdminFeedbackProvider>
        </SiteContentProvider>
      </StoreSettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);
