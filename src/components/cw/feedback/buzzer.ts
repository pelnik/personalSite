export function buzz(ctx: AudioContext | null) {
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  oscillator.type = 'square';
  oscillator.frequency.value = 110;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
  gain.gain.setValueAtTime(0.15, now + 0.19);
  gain.gain.linearRampToValueAtTime(0, now + 0.2);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
  oscillator.start(now);
  oscillator.stop(now + 0.21);
}
