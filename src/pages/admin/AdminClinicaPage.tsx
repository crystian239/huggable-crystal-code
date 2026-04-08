import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore } from "@/data/clinicStore";
import { Building2, Stethoscope, Users, Shield } from "lucide-react";

export default function AdminClinicaPage() {
  const clinicStore = useClinicStore();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Informações da Clínica</h2>
          <p className="text-sm text-muted-foreground">Visão geral e links rápidos</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Dados da Clínica
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-accent/50 rounded-xl p-4">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Nome</span>
              <p className="font-medium text-foreground mt-1">{clinicStore.settings.name}</p>
            </div>
            <div className="bg-accent/50 rounded-xl p-4">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Telefone</span>
              <p className="font-medium text-foreground mt-1">{clinicStore.settings.phone || "—"}</p>
            </div>
            <div className="bg-accent/50 rounded-xl p-4">
              <span className="text-xs text-muted-foreground uppercase font-semibold">E-mail</span>
              <p className="font-medium text-foreground mt-1">{clinicStore.settings.email || "—"}</p>
            </div>
            <div className="bg-accent/50 rounded-xl p-4">
              <span className="text-xs text-muted-foreground uppercase font-semibold">CNPJ</span>
              <p className="font-medium text-foreground mt-1">{clinicStore.settings.cnpj || "—"}</p>
            </div>
            <div className="bg-accent/50 rounded-xl p-4 sm:col-span-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Endereço</span>
              <p className="font-medium text-foreground mt-1">{clinicStore.settings.address || "—"}</p>
            </div>
            <div className="bg-accent/50 rounded-xl p-4 sm:col-span-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Médicos</span>
              <p className="font-medium text-foreground mt-1">{clinicStore.settings.doctors?.join(", ") || "—"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Portal do Paciente", href: "/portal-paciente", icon: Users, desc: "Portal de acesso dos pacientes" },
            { label: "Configurações da Clínica", href: "/configuracoes", icon: Building2, desc: "Editar configurações gerais" },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <a key={link.href} href={link.href} className="block bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground text-sm">{link.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </a>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
