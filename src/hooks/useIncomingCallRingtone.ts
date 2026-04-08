import { useEffect, useRef } from "react";
import { useTeleconsultaStore } from "@/data/teleconsultaStore";

/**
 * Plays a repeating ringtone when there's an incoming call (status === "ringing")
 * for the given patientId. Stops when the call is answered, declined, or ended.
 */
export function useIncomingCallRingtone(patientId: string | null) {
  const activeCall = useTeleconsultaStore((s) => s.activeCall);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const isRinging =
    activeCall &&
    activeCall.status === "ringing" &&
    patientId &&
    activeCall.patientId === patientId;

  useEffect(() => {
    if (!isRinging) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const playRing = () => {
      try {
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") ctx.resume();

        // Two-tone ringtone pattern (like a phone)
        const notes = [
          { freq: 440, delay: 0, dur: 0.15 },
          { freq: 480, delay: 0.18, dur: 0.15 },
          { freq: 440, delay: 0.4, dur: 0.15 },
          { freq: 480, delay: 0.58, dur: 0.15 },
        ];

        notes.forEach(({ freq, delay, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.18, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + dur);
        });
      } catch {
        // AudioContext not available
      }
    };

    // Play immediately and then every 2 seconds
    playRing();
    intervalRef.current = setInterval(playRing, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRinging]);
}
