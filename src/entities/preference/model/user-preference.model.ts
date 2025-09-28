export namespace Preference {
  export interface Model {
    djingGuideHidden: boolean;
    setDjingGuideHidden: (hidden: boolean) => void;
    reset: () => void;
  }
}
