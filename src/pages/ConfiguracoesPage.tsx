import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore } from "@/data/clinicStore";
import { Button } from "@/components/ui/button";
import { Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { maskPhone, maskCNPJ, maskCRP } from "@/lib/masks";
import clinicLogo from "@/assets/clinic-logo.png";

export default function ConfiguracoesPage() {
  const settings = useClinicStore((s) => s.settings);
  const updateSettings = useClinicStore((s) => s.updateSettings);
  const [form, setForm] = useState({ ...settings });

  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  const handleSave = () => {
    updateSettings(form);
    toast.success("Configurações salvas!");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const fields = [
    { key: "name", label: "Nome da Clínica", placeholder: "Clínica Magia Da Linguagem" },
    { key: "doctorName", label: "Nome do Profissional", placeholder: "Dra. Maria Silva" },
    { key: "crp", label: "CRP / CRM", placeholder: "CRP 00/00000" },
    { key: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00" },
    { key: "phone", label: "Telefone", placeholder: "(00) 00000-0000" },
    { key: "email", label: "Email", placeholder: "contato@clinica.com" },
    { key: "address", label: "Endereço", placeholder: "Rua, número, bairro, cidade - UF" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          {/* Logo */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Logo da Clínica</label>
            <div className="flex items-center gap-4">
              <img src={form.logo || clinicLogo} alt="Logo" className="h-20 w-20 rounded-xl object-contain border border-border p-1" />
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-sm rounded-lg hover:bg-secondary/80 transition-colors text-foreground">
                  <Upload className="h-4 w-4" /> Alterar Logo
                </div>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Fields */}
          {fields.map((f) => {
            const maskFn = f.key === "phone" ? maskPhone : f.key === "cnpj" ? maskCNPJ : f.key === "crp" ? maskCRP : undefined;
            return (
              <div key={f.key}>
                <label className="text-sm font-medium text-foreground mb-1 block">{f.label}</label>
                <input
                  type="text"
                  value={(form as any)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: maskFn ? maskFn(e.target.value) : e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            );
          })}

          <Button onClick={handleSave} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-1" /> Salvar Configurações
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold text-foreground mb-3">Credenciais de Acesso</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Usuário</p>
              <p className="font-medium text-foreground">admin</p>
            </div>
            <div>
              <p className="text-muted-foreground">Senha</p>
              <p className="font-medium text-foreground">admin123</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Para alterar as credenciais, conecte o Lovable Cloud para autenticação real.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
