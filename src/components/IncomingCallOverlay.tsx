import { useState, useEffect } from "react";
import { useTeleconsultaStore } from "@/data/teleconsultaStore";
import { Phone, PhoneOff, Video } from "lucide-react";

interface Props {
  patientId: string;
  onAnswer: (roomName: string) => void;
}

export default function IncomingCallOverlay({ patientId, onAnswer }: Props) {
  const { activeCall, answerCall, declineCall, endCall, rooms } = useTeleconsultaStore();
  const [elapsed, setElapsed] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);

  const isForMe = activeCall && activeCall.patientId === patientId && activeCall.status === "ringing";

  useEffect(() => {
    if (!isForMe) { setElapsed(0); return; }
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isForMe]);

  useEffect(() => {
    if (!isForMe) return;
    const interval = setInterval(() => setPulsePhase((p) => (p + 1) % 3), 600);
    return () => clearInterval(interval);
  }, [isForMe]);

  // Auto-end after 60 seconds
  useEffect(() => {
    if (isForMe && elapsed >= 60) endCall();
  }, [elapsed, isForMe, endCall]);

  if (!isForMe || !activeCall) return null;

  const room = rooms.find((r) => r.id === activeCall.roomId);
  const initials = activeCall.doctorName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleAnswer = () => {
    answerCall();
    if (room) {
      onAnswer(room.roomName);
    }
  };

  const handleDecline = () => {
    declineCall();
    setTimeout(() => endCall(), 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-gradient-to-b from-[hsl(220,30%,12%)] via-[hsl(220,25%,16%)] to-[hsl(220,20%,10%)]">
      {/* Top area - subtle pulse rings */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Pulsing rings */}
        <div className="absolute">
          <div className="w-52 h-52 rounded-full border border-white/5 animate-ping" style={{ animationDuration: "2s" }} />
        </div>
        <div className="absolute">
          <div className="w-40 h-40 rounded-full border border-white/10 animate-ping" style={{ animationDuration: "1.5s", animationDelay: "0.5s" }} />
        </div>

        {/* Doctor avatar */}
        <div className="relative z-10 mb-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-2xl shadow-primary/30">
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-lg">
            <Video className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Doctor info */}
        <h2 className="text-2xl font-bold text-white mb-1">{activeCall.doctorName}</h2>
        {activeCall.doctorSpecialty && (
          <p className="text-sm text-white/50 mb-3">{activeCall.doctorSpecialty}</p>
        )}

        {/* Call status */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${pulsePhase === i ? "bg-success scale-125" : "bg-white/20"}`}
              />
            ))}
          </div>
          <p className="text-white/70 text-sm font-medium">
            Videochamada recebida
          </p>
        </div>

        <p className="text-white/30 text-xs mt-2">
          {elapsed < 10 ? `0:0${elapsed}` : elapsed < 60 ? `0:${elapsed}` : "1:00"}
        </p>
      </div>

      {/* Bottom area - action buttons */}
      <div className="pb-16 pt-8 flex items-center gap-16">
        {/* Decline */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleDecline}
            className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center shadow-xl shadow-destructive/30 hover:bg-destructive/90 active:scale-95 transition-all"
          >
            <PhoneOff className="h-7 w-7 text-white" />
          </button>
          <span className="text-white/60 text-xs font-medium">Recusar</span>
        </div>

        {/* Accept */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleAnswer}
            className="w-16 h-16 rounded-full bg-success flex items-center justify-center shadow-xl shadow-success/30 hover:bg-success/90 active:scale-95 transition-all animate-pulse"
          >
            <Phone className="h-7 w-7 text-white" />
          </button>
          <span className="text-white/60 text-xs font-medium">Atender</span>
        </div>
      </div>

      {/* Swipe hint */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-white/20 text-[10px]">Clínica • Teleconsulta</p>
      </div>
    </div>
  );
}
