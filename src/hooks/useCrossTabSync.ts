import { useEffect } from "react";
import { useTeleconsultaStore } from "@/data/teleconsultaStore";

/**
 * Listens for localStorage "storage" events so that when the doctor
 * starts a call in one tab, the patient portal in another tab
 * immediately picks up the new activeCall state.
 */
export function useCrossTabSync() {
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== "teleconsulta-storage" || !e.newValue) return;

      try {
        const parsed = JSON.parse(e.newValue);
        const newState = parsed?.state;
        if (!newState) return;

        // Rehydrate the entire persisted state into zustand
        useTeleconsultaStore.setState({
          rooms: newState.rooms ?? [],
          chatMessages: newState.chatMessages ?? [],
          patientAccounts: newState.patientAccounts ?? [],
          patientMessages: newState.patientMessages ?? [],
          activeCall: newState.activeCall ?? null,
        });
      } catch {
        // ignore parse errors
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
}
