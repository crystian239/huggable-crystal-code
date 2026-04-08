import { useMemo } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore } from "@/data/clinicStore";
import { Cake, Gift, PartyPopper } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AniversariosPage() {
  const patients = useClinicStore((s) => s.patients);
  const birthdays = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();

    return patients
      .filter((patient) => {
        if (!patient.birthDate) return false;
        return new Date(patient.birthDate + "T00:00:00").getMonth() === month;
      })
      .map((patient) => {
        const birth = new Date(patient.birthDate + "T00:00:00");
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }

        return { ...patient, age: age + 1 };
      })
      .sort(
        (a, b) =>
          new Date(a.birthDate + "T00:00:00").getDate() -
          new Date(b.birthDate + "T00:00:00").getDate(),
      );
  }, [patients]);
  const today = new Date();
  const monthName = format(today, "MMMM", { locale: ptBR });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
            <Cake className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Aniversariantes</h1>
            <p className="text-sm text-muted-foreground capitalize">{monthName} de {today.getFullYear()}</p>
          </div>
        </div>

        {birthdays.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum aniversariante neste mês.</p>
            <p className="text-xs text-muted-foreground mt-1">Cadastre a data de nascimento dos pacientes para ver aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {birthdays.map((p) => {
              const birthDay = new Date(p.birthDate + "T00:00:00").getDate();
              const isToday = birthDay === today.getDate();
              return (
                <div key={p.id} className={`bg-card border rounded-xl p-4 transition-all ${isToday ? "border-warning shadow-lg shadow-warning/10 ring-2 ring-warning/20" : "border-border"}`}>
                  {isToday && (
                    <div className="flex items-center gap-2 mb-3 bg-warning/10 text-warning rounded-lg px-3 py-1.5 text-xs font-medium">
                      <PartyPopper className="h-4 w-4" /> Hoje é o aniversário!
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${isToday ? "bg-warning/20 text-warning" : "bg-primary/10 text-primary"}`}>
                      {p.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Dia {birthDay} · Fará <span className="font-semibold text-foreground">{p.age} anos</span>
                      </p>
                      {p.phone && <p className="text-xs text-muted-foreground mt-0.5">{p.phone}</p>}
                    </div>
                    <div className={`text-3xl font-bold ${isToday ? "text-warning" : "text-muted-foreground/30"}`}>
                      {birthDay}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{birthdays.length}</strong> aniversariante{birthdays.length !== 1 ? "s" : ""} em <span className="capitalize">{monthName}</span>.
            {birthdays.filter((b) => new Date(b.birthDate + "T00:00:00").getDate() === today.getDate()).length > 0 && (
              <span className="text-warning font-medium"> 🎂 Há aniversariante(s) hoje!</span>
            )}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
