import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield, Sparkles, ArrowLeft, Mail, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import clinicLogo from "@/assets/clinic-logo.png";
import { useClinicStore } from "@/data/clinicStore";
import { useAuthStore } from "@/data/authStore";
import { checkRateLimit, resetRateLimit, sanitizeInput } from "@/lib/security";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

type PageMode = "login" | "forgot-identify" | "forgot-code" | "forgot-newpass";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isCpfMode, setIsCpfMode] = useState(false);
  const navigate = useNavigate();
  const settings = useClinicStore((s) => s.settings);
  const login = useAuthStore((s) => s.login);
  const findUserByIdentifier = useAuthStore((s) => s.findUserByIdentifier);
  const resetPassword = useAuthStore((s) => s.resetPassword);

  // Password reset state
  const [mode, setMode] = useState<PageMode>("login");
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [foundUserEmail, setFoundUserEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [codeTimer, setCodeTimer] = useState(0);

  useEffect(() => {
    if (codeTimer > 0) {
      const t = setTimeout(() => setCodeTimer(codeTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [codeTimer]);

  const handleUsernameChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length > 0 && /^\d/.test(val)) {
      setIsCpfMode(true);
      setUsername(formatCPF(val));
    } else {
      setIsCpfMode(false);
      setUsername(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }
    const rateCheck = checkRateLimit(`admin-login-${username.trim().toLowerCase()}`);
    if (!rateCheck.allowed) {
      setIsLocked(true);
      const mins = rateCheck.lockoutEnds ? Math.ceil((rateCheck.lockoutEnds.getTime() - Date.now()) / 60000) : 15;
      toast.error(`Conta bloqueada por ${mins} minutos. Muitas tentativas falhas.`);
      return;
    }
    const sanitizedUsername = sanitizeInput(username.trim());
    if (login(sanitizedUsername, password)) {
      resetRateLimit(`admin-login-${username.trim().toLowerCase()}`);
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } else {
      toast.error(`Usuário ou senha incorretos. ${rateCheck.remainingAttempts} tentativa(s) restante(s).`);
      if (rateCheck.remainingAttempts <= 1) setIsLocked(true);
    }
  };

  const handleForgotIdentify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim()) {
      toast.error("Informe seu usuário ou CPF.");
      return;
    }
    const user = findUserByIdentifier(sanitizeInput(resetIdentifier.trim()));
    if (!user) {
      toast.error("Usuário não encontrado.");
      return;
    }
    const code = generateCode();
    setGeneratedCode(code);
    // Simulate sending email - show code in toast for demo
    const maskedName = user.username;
    setFoundUserEmail(maskedName);
    setCodeTimer(120);
    setMode("forgot-code");
    toast.success(
      `Código enviado para o email cadastrado de ${maskedName}. (Código de demonstração: ${code})`,
      { duration: 15000 }
    );
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode.trim()) {
      toast.error("Digite o código recebido.");
      return;
    }
    if (resetCode.trim() !== generatedCode) {
      toast.error("Código inválido. Tente novamente.");
      return;
    }
    setMode("forgot-newpass");
    toast.success("Código verificado! Defina sua nova senha.");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    const success = resetPassword(resetIdentifier.trim(), newPassword);
    if (success) {
      toast.success("Senha redefinida com sucesso! Faça login com a nova senha.");
      setMode("login");
      setResetIdentifier("");
      setResetCode("");
      setGeneratedCode("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error("Erro ao redefinir senha.");
    }
  };

  const goBackToLogin = () => {
    setMode("login");
    setResetIdentifier("");
    setResetCode("");
    setGeneratedCode("");
    setNewPassword("");
    setConfirmPassword("");
    setCodeTimer(0);
  };

  const resendCode = () => {
    if (codeTimer > 0) return;
    const code = generateCode();
    setGeneratedCode(code);
    setCodeTimer(120);
    toast.success(`Novo código enviado! (Código de demonstração: ${code})`, { duration: 15000 });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden sparkle-bg">
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-magic-rose/5 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-magic-gold/5 blur-3xl animate-float" />
      <div className="absolute top-[15%] left-[20%] w-1.5 h-1.5 rounded-full bg-magic-gold/40 animate-twinkle" />
      <div className="absolute top-[30%] right-[25%] w-1 h-1 rounded-full bg-primary/30 animate-twinkle" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-[25%] left-[30%] w-1 h-1 rounded-full bg-magic-lavender/40 animate-twinkle" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[60%] right-[15%] w-1.5 h-1.5 rounded-full bg-magic-gold/30 animate-twinkle" style={{ animationDelay: '1.5s' }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="relative animate-float">
            <div className="absolute -inset-3 rounded-2xl magic-gradient opacity-20 blur-lg" />
            <img src={settings.logo || clinicLogo} alt="Logo" className="h-24 w-24 mb-4 relative rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground mt-2">{settings.name}</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-magic-gold" />
            {mode === "login" ? "Painel de Gestão" : "Redefinir Senha"}
            <Sparkles className="h-3.5 w-3.5 text-magic-gold" />
          </p>
        </div>

        {/* LOGIN MODE */}
        {mode === "login" && (
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4 magic-shadow">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Usuário ou CPF</label>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="Digite seu usuário ou CPF"
                autoComplete="username"
                className="w-full border border-input bg-background/80 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all backdrop-blur-sm"
              />
              {isCpfMode && (
                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Login por CPF detectado
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full border border-input bg-background/80 rounded-xl px-4 py-2.5 pr-10 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all backdrop-blur-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMode("forgot-identify")}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <KeyRound className="h-3 w-3" /> Esqueceu a senha?
            </button>

            <Button type="submit" className="w-full magic-gradient border-0 text-primary-foreground font-semibold rounded-xl h-11 hover:opacity-90 transition-opacity" disabled={isLocked}>
              {isLocked ? "Conta Bloqueada" : "✨ Entrar"}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-background/80 px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                const result = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin,
                });
                if (result.error) {
                  toast.error("Não foi possível entrar com Google.");
                  return;
                }
                if (result.redirected) return;
                const { data } = await supabase.auth.getUser();
                const email = data.user?.email || "google-user";
                const name = (data.user?.user_metadata?.full_name as string) || email.split("@")[0];
                useAuthStore.setState({
                  user: { id: data.user?.id || crypto.randomUUID(), username: name, role: "admin" },
                  sessionToken: crypto.randomUUID(),
                  isAuthenticated: true,
                });
                toast.success(`Bem-vindo, ${name}!`);
                navigate("/dashboard");
              }}
              className="w-full rounded-xl h-11 font-semibold flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              Entrar com Google
            </Button>

            <div className="flex items-center gap-1.5 justify-center text-xs text-muted-foreground mt-2">
              <Shield className="h-3 w-3" />
              <span>Conexão segura e encantada</span>
            </div>
          </form>
        )}

        {/* FORGOT - IDENTIFY USER */}
        {mode === "forgot-identify" && (
          <form onSubmit={handleForgotIdentify} className="glass-card rounded-2xl p-6 space-y-4 magic-shadow">
            <button type="button" onClick={goBackToLogin} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Voltar ao login
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Recuperação de Senha</h2>
                <p className="text-xs text-muted-foreground">Informe seu usuário ou CPF para receber o código</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Usuário ou CPF</label>
              <input
                type="text"
                value={resetIdentifier}
                onChange={(e) => setResetIdentifier(e.target.value)}
                placeholder="Digite seu usuário ou CPF"
                className="w-full border border-input bg-background/80 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all backdrop-blur-sm"
              />
            </div>
            <Button type="submit" className="w-full magic-gradient border-0 text-primary-foreground font-semibold rounded-xl h-11 hover:opacity-90 transition-opacity">
              📧 Enviar Código
            </Button>
          </form>
        )}

        {/* FORGOT - ENTER CODE */}
        {mode === "forgot-code" && (
          <form onSubmit={handleVerifyCode} className="glass-card rounded-2xl p-6 space-y-4 magic-shadow">
            <button type="button" onClick={goBackToLogin} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Voltar ao login
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Verificar Código</h2>
                <p className="text-xs text-muted-foreground">
                  Código enviado para o email de <span className="font-medium text-foreground">{foundUserEmail}</span>
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Código de 6 dígitos</label>
              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full border border-input bg-background/80 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all backdrop-blur-sm text-center text-2xl tracking-[0.5em] font-mono"
              />
            </div>
            <Button type="submit" className="w-full magic-gradient border-0 text-primary-foreground font-semibold rounded-xl h-11 hover:opacity-90 transition-opacity">
              ✅ Verificar Código
            </Button>
            <div className="text-center">
              {codeTimer > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Reenviar código em <span className="font-medium text-foreground">{Math.floor(codeTimer / 60)}:{(codeTimer % 60).toString().padStart(2, "0")}</span>
                </p>
              ) : (
                <button type="button" onClick={resendCode} className="text-xs text-primary hover:underline">
                  Reenviar código
                </button>
              )}
            </div>
          </form>
        )}

        {/* FORGOT - NEW PASSWORD */}
        {mode === "forgot-newpass" && (
          <form onSubmit={handleResetPassword} className="glass-card rounded-2xl p-6 space-y-4 magic-shadow">
            <button type="button" onClick={goBackToLogin} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Voltar ao login
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Nova Senha</h2>
                <p className="text-xs text-muted-foreground">Defina sua nova senha de acesso</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Nova Senha</label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-input bg-background/80 rounded-xl px-4 py-2.5 pr-10 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all backdrop-blur-sm"
                />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                  {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Confirmar Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full border border-input bg-background/80 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all backdrop-blur-sm"
              />
            </div>
            <Button type="submit" className="w-full magic-gradient border-0 text-primary-foreground font-semibold rounded-xl h-11 hover:opacity-90 transition-opacity">
              🔐 Redefinir Senha
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
