import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import clinicLogo from "@/assets/clinic-logo.png";
import { useClinicStore } from "@/data/clinicStore";
import { useAuthStore } from "@/data/authStore";
import { checkRateLimit, resetRateLimit, sanitizeInput } from "@/lib/security";

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isCpfMode, setIsCpfMode] = useState(false);
  const navigate = useNavigate();
  const settings = useClinicStore((s) => s.settings);
  const login = useAuthStore((s) => s.login);

  const handleUsernameChange = (val: string) => {
    // Auto-detect CPF input (starts with numbers)
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden sparkle-bg">
      {/* Decorative elements */}
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
            Painel de Gestão
            <Sparkles className="h-3.5 w-3.5 text-magic-gold" />
          </p>
        </div>

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

          <Button type="submit" className="w-full magic-gradient border-0 text-primary-foreground font-semibold rounded-xl h-11 hover:opacity-90 transition-opacity" disabled={isLocked}>
            {isLocked ? "Conta Bloqueada" : "✨ Entrar"}
          </Button>

          <div className="flex items-center gap-1.5 justify-center text-xs text-muted-foreground mt-2">
            <Shield className="h-3 w-3" />
            <span>Conexão segura e encantada</span>
          </div>
        </form>
      </div>
    </div>
  );
}
