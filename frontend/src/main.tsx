// Caminho: frontend/src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// CAMINHO CORRIGIDO: de "./context/AuthContext.tsx" para "./contexts/AuthContext.tsx"
import { AuthProvider } from "./contexts/AuthContext.tsx"; // Importe

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      {" "}
      {/* ENVOLVA A APLICAÇÃO */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
