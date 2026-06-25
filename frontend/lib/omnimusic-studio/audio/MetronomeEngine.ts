export class MetronomeEngine {
  private context: AudioContext | null = null;
  private nextBeat = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private enabled = false;
  private tempo = 120;

  attach(context: AudioContext): void {
    this.context = context;
  }

  setTempo(tempo: number): void {
    this.tempo = tempo;
  }

  start(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled || !this.context) {
      this.stop();
      return;
    }
    this.stop();
    this.nextBeat = this.context.currentTime + 0.05;
    this.intervalId = setInterval(() => this.tick(), 25);
  }

  private tick(): void {
    if (!this.context || !this.enabled) return;
    const beatSec = 60 / this.tempo;
    while (this.nextBeat < this.context.currentTime + 0.1) {
      this.click(this.nextBeat);
      this.nextBeat += beatSec;
    }
  }

  private click(time: number): void {
    if (!this.context) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(time);
    osc.stop(time + 0.04);
  }

  stop(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
  }

  dispose(): void {
    this.stop();
    this.context = null;
  }
}

export const metronomeEngine = new MetronomeEngine();
