export interface Jscw {
  audioCtx?: AudioContext;
  setWpm(n: number): void;
  setEff(n: number): void;
  setFreq(n: number): void;
  play(text: string): void;
  stop(): void;
  onCharacterPlay: (c: { n: number; c: string }) => void;
  onFinished: () => void;
}
declare global {
  interface Window { jscw?: new (params?: object) => Jscw }
}
