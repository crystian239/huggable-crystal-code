// Notification sound manager using Web Audio API

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playMelody(notes: { freq: number; dur: number; delay: number }[], type: OscillatorType = "sine", volume = 0.12) {
  const ctx = getCtx();
  notes.forEach(({ freq, dur, delay }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + dur);
  });
}

/** 💬 Nova mensagem */
export function playMessageSound() {
  playMelody([
    { freq: 880, dur: 0.12, delay: 0 },
    { freq: 1100, dur: 0.15, delay: 0.12 },
  ], "sine", 0.1);
}

/** 🎧 Suporte */
export function playSupportSound() {
  playMelody([
    { freq: 523, dur: 0.15, delay: 0 },
    { freq: 659, dur: 0.15, delay: 0.15 },
    { freq: 784, dur: 0.2, delay: 0.3 },
  ], "triangle", 0.1);
}

/** 📅 Agendamento */
export function playAppointmentSound() {
  playMelody([
    { freq: 1047, dur: 0.3, delay: 0 },
    { freq: 1319, dur: 0.4, delay: 0.15 },
  ], "sine", 0.08);
}

/** 🎂 Aniversário */
export function playBirthdaySound() {
  playMelody([
    { freq: 523, dur: 0.12, delay: 0 },
    { freq: 523, dur: 0.12, delay: 0.15 },
    { freq: 587, dur: 0.25, delay: 0.3 },
    { freq: 523, dur: 0.2, delay: 0.55 },
    { freq: 698, dur: 0.25, delay: 0.75 },
    { freq: 659, dur: 0.35, delay: 1.0 },
  ], "triangle", 0.1);
}

/** 🔔 Notificação geral */
export function playNotificationSound() {
  playMelody([
    { freq: 740, dur: 0.15, delay: 0 },
    { freq: 988, dur: 0.25, delay: 0.1 },
  ], "sine", 0.1);
}

/** 💰 Financeiro */
export function playFinanceSound() {
  playMelody([
    { freq: 1200, dur: 0.08, delay: 0 },
    { freq: 1500, dur: 0.08, delay: 0.08 },
    { freq: 1800, dur: 0.15, delay: 0.16 },
  ], "square", 0.05);
}

/** ✅ Sucesso */
export function playSuccessSound() {
  playMelody([
    { freq: 523, dur: 0.1, delay: 0 },
    { freq: 659, dur: 0.1, delay: 0.1 },
    { freq: 784, dur: 0.15, delay: 0.2 },
    { freq: 1047, dur: 0.25, delay: 0.3 },
  ], "sine", 0.08);
}

/** ❌ Erro */
export function playErrorSound() {
  playMelody([
    { freq: 400, dur: 0.15, delay: 0 },
    { freq: 300, dur: 0.25, delay: 0.18 },
  ], "sawtooth", 0.06);
}

/** 📨 Aviso */
export function playAnnouncementSound() {
  playMelody([
    { freq: 660, dur: 0.1, delay: 0 },
    { freq: 880, dur: 0.1, delay: 0.12 },
    { freq: 660, dur: 0.1, delay: 0.24 },
    { freq: 880, dur: 0.2, delay: 0.36 },
  ], "triangle", 0.08);
}

/** 🔴 Live iniciada - som dramático */
export function playLiveStartSound() {
  playMelody([
    { freq: 440, dur: 0.15, delay: 0 },
    { freq: 554, dur: 0.15, delay: 0.12 },
    { freq: 659, dur: 0.15, delay: 0.24 },
    { freq: 880, dur: 0.3, delay: 0.36 },
  ], "triangle", 0.15);
}

/** 🖐 Solicitação para participar */
export function playJoinRequestSound() {
  playMelody([
    { freq: 600, dur: 0.1, delay: 0 },
    { freq: 800, dur: 0.1, delay: 0.1 },
    { freq: 600, dur: 0.1, delay: 0.2 },
  ], "sine", 0.1);
}
