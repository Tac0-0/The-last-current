// Original synthesized cues. Nothing is fetched, and autoplay failure is harmless.
export class AudioCues {
  constructor(progress) {
    this.progress = progress;
    this.context = null;
    this.lastCollection = 0;
  }
  enable() {
    try {
      const AudioContext =
        globalThis.AudioContext ?? globalThis.webkitAudioContext;
      if (!this.context && AudioContext) this.context = new AudioContext();
      this.context?.resume()?.catch(() => {});
    } catch {
      /* Silent fallback for restricted school browsers. */
    }
  }
  play(type) {
    if (this.progress.mute || !this.context || this.context.state !== "running")
      return;
    const now = this.context.currentTime;
    if (type === "collect" && now - this.lastCollection < 0.15) return;
    if (type === "collect") this.lastCollection = now;
    const frequencies = { collect: 660, build: 440, boss: 110, leak: 165 };
    if (!frequencies[type]) return;
    const oscillator = this.context.createOscillator(),
      gain = this.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequencies[type], now);
    oscillator.frequency.exponentialRampToValueAtTime(
      frequencies[type] * 0.7,
      now + 0.22,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.3);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
}
