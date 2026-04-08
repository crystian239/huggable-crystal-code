/**
 * Proteção contra DevTools, inspeção de código e cópia de conteúdo.
 * Dificulta (não impede 100%) acesso ao código-fonte via navegador.
 */

export function enableDevToolsProtection() {
  // 1. Bloquear clique direito
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
  });

  // 2. Bloquear atalhos de teclado do DevTools e View Source
  document.addEventListener("keydown", (e) => {
    // F12
    if (e.key === "F12") {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element picker)
    if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) {
      e.preventDefault();
      return false;
    }

    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key.toUpperCase() === "U") {
      e.preventDefault();
      return false;
    }

    // Ctrl+S (Save page)
    if (e.ctrlKey && e.key.toUpperCase() === "S") {
      e.preventDefault();
      return false;
    }

    // Ctrl+P (Print)
    if (e.ctrlKey && e.key.toUpperCase() === "P") {
      e.preventDefault();
      return false;
    }
  });

  // 3. Bloquear arrastar elementos (drag)
  document.addEventListener("dragstart", (e) => {
    e.preventDefault();
    return false;
  });

  // 4. Bloquear seleção de texto (dificulta copiar)
  document.addEventListener("selectstart", (e) => {
    // Permitir seleção em inputs e textareas
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return true;
    }
    e.preventDefault();
    return false;
  });

  // 5. Bloquear copiar (Ctrl+C fora de inputs)
  document.addEventListener("copy", (e) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return true;
    }
    e.preventDefault();
    return false;
  });

  // 6. Detectar DevTools aberto via debugger trick
  const detectDevTools = () => {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > threshold || heightDiff > threshold) {
      document.body.innerHTML = "";
      document.title = "⚠️ Acesso não autorizado";
    }
  };

  // Check periodically
  setInterval(detectDevTools, 2000);

  // 7. Anti-debugger (dificulta uso do console)
  const antiDebug = () => {
    const start = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    const end = performance.now();
    if (end - start > 100) {
      document.body.innerHTML = "";
      document.title = "⚠️ Acesso não autorizado";
    }
  };

  // Run anti-debug in production only
  if (import.meta.env.PROD) {
    setInterval(antiDebug, 3000);
  }

  // 8. Console warning
  console.log(
    "%c⚠️ ATENÇÃO!",
    "color: red; font-size: 40px; font-weight: bold;"
  );
  console.log(
    "%cEste é um recurso do navegador destinado a desenvolvedores. Se alguém pediu para você colar algo aqui, trata-se de um golpe.",
    "color: #333; font-size: 16px;"
  );
  console.log(
    "%cFeche esta janela imediatamente.",
    "color: red; font-size: 14px; font-weight: bold;"
  );
}
