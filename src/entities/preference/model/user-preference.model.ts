export namespace Preference {
  export interface Model {
    djingGuideHidden: boolean;
    setDjingGuideHidden: (hidden: boolean) => void;
    volume: number;
    muted: boolean;
    setVolume: (v: number) => void;
    setMuted: (m: boolean) => void;
    reset: () => void;
  }
}
