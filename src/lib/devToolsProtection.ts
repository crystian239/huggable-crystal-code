/**
 * Proteção contra DevTools, inspeção de código e cópia de conteúdo.
 * Dificulta (não impede 100%) acesso ao código-fonte via navegador.
 * 
 * IMPORTANTE: Nenhuma proteção deve destruir o DOM (innerHTML = ""),
 * pois causa tela branca irrecuperável. Em vez disso, usamos redirecionamento.
 */

export function enableDevToolsProtection() {
  // Não executar dentro de iframes (preview do Lovable, etc.)
  if (window.self !== window.top) return;

  // 1. Bloquear clique direito
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
  });

  // 2. Bloquear atalhos de teclado do DevTools e View Source
  document.addEventListener("keydown", (e) => {
    if (e.key === "F12") {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && e.key.toUpperCase() === "U") {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && e.key.toUpperCase() === "S") {
      e.preventDefault();
      return false;
    }
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

  // 6. Console warning (seguro, apenas informativo)
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
