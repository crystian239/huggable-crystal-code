import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useAuthStore, SUPER_ADMIN_CPF } from "@/data/authStore";
import { Shield, Stethoscope, Users } from "lucide-react";

export default function AdminUsuariosPage() {
  const { users } = useAuthStore();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Usuários do Sistema</h2>
          <p className="text-sm text-muted-foreground">{users.length} usuário(s) cadastrado(s)</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 py-3 px-4 rounded-xl bg-accent/50 border border-border/50">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  u.role === "admin" ? "bg-primary/10" : u.role === "doctor" ? "bg-[hsl(200,70%,50%)]/10" : "bg-accent"
                }`}>
                  {u.role === "admin" ? <Shield className="h-5 w-5 text-primary" /> :
                   u.role === "doctor" ? <Stethoscope className="h-5 w-5 text-[hsl(200,70%,50%)]" /> :
                   <Users className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{u.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">{u.role === "admin" ? "Administrador" : u.role === "doctor" ? "Médico" : "Recepcionista"}</p>
                </div>
                {u.role === "admin" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">Super Admin</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Segurança
          </h3>
          <div className="bg-accent/50 rounded-xl p-4 text-sm">
            <p className="text-muted-foreground">
              <strong className="text-foreground">CPF Administrador:</strong> {SUPER_ADMIN_CPF}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Apenas este CPF tem acesso ao painel de controle total.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
