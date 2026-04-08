import { useEffect, useRef } from "react";
import { useClinicStore } from "@/data/clinicStore";
import { useSupportStore } from "@/data/supportStore";
import { useTeleconsultaStore } from "@/data/teleconsultaStore";
import {
  playMessageSound,
  playSupportSound,
  playAppointmentSound,
  playAnnouncementSound,
  playNotificationSound,
} from "@/lib/notificationSounds";

/**
 * Monitors stores for new items and plays appropriate sounds.
 * Mount once at the app/layout level.
 */
export function useNotificationSounds() {
  // Track previous counts to detect new items
  const prevCounts = useRef<Record<string, number>>({});

  const clinicMessages = useClinicStore((s) => s.messages);
  const clinicNotifications = useClinicStore((s) => s.notifications);
  const announcements = useClinicStore((s) => s.announcements);
  const supportMessages = useSupportStore((s) => s.messages);
  const patientMessages = useTeleconsultaStore((s) => s.patientMessages);
  const appointments = useClinicStore((s) => s.appointments);

  useEffect(() => {
    const counts = {
      clinicMsg: clinicMessages.length,
      supportMsg: supportMessages.length,
      patientMsg: patientMessages.length,
      announcements: announcements.length,
      notifications: clinicNotifications.length,
      appointments: appointments.length,
    };

    // Skip first render (initialization)
    if (Object.keys(prevCounts.current).length === 0) {
      prevCounts.current = { ...counts };
      return;
    }

    const prev = prevCounts.current;

    // Doctor/admin messages
    if (counts.clinicMsg > prev.clinicMsg) {
      playMessageSound();
    }
    // Support messages
    else if (counts.supportMsg > prev.supportMsg) {
      playSupportSound();
    }
    // Patient messages
    else if (counts.patientMsg > prev.patientMsg) {
      playMessageSound();
    }
    // Announcements
    else if (counts.announcements > prev.announcements) {
      playAnnouncementSound();
    }
    // Clinic notifications (confirmations, cancellations)
    else if (counts.notifications > prev.notifications) {
      playNotificationSound();
    }
    // Appointments
    else if (counts.appointments > prev.appointments) {
      playAppointmentSound();
    }

    prevCounts.current = { ...counts };
  }, [clinicMessages.length, supportMessages.length, patientMessages.length, announcements.length, clinicNotifications.length, appointments.length]);
}
