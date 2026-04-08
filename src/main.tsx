import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { enableDevToolsProtection } from "./lib/devToolsProtection";

// Ativar proteções apenas em produção
if (import.meta.env.PROD) {
  enableDevToolsProtection();
}

createRoot(document.getElementById("root")!).render(<App />);
